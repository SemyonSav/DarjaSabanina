import "server-only";
import { randomBytes } from "node:crypto";
import sharp from "sharp";
import { slugify } from "@/lib/slug";
import { storage } from "@/lib/storage";
import { createMedia } from "@/lib/repos";
import type { MediaRow } from "@/lib/db/schema";

export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
const MAX_WIDTH = 2000;
const MAX_PIXELS = 50_000_000;

/** Форматы, которые принимаем (определяются по содержимому, не по расширению) */
const ACCEPTED_FORMATS = new Set(["jpeg", "png", "webp", "gif", "heif", "avif", "tiff"]);

export class UploadError extends Error {}

/**
 * Имя файла из исходного: «Фото кабинета.JPG» → `2026/10/foto-kabineta-a1b2c3.webp`.
 * Понятное имя немного помогает поиску по картинкам.
 */
function storagePath(originalName: string): string {
  const base = slugify(originalName.replace(/\.[^.]+$/, "")).slice(0, 50) || "image";
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${now.getFullYear()}/${month}/${base}-${randomBytes(3).toString("hex")}.webp`;
}

/**
 * Проверяет картинку, поворачивает по EXIF, удаляет метаданные
 * (в том числе геолокацию), уменьшает до MAX_WIDTH и сохраняет в WebP.
 */
export async function processAndStoreImage(
  file: File,
  alt = "",
): Promise<MediaRow> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new UploadError("Файл больше 15 МБ");
  }
  const input = Buffer.from(await file.arrayBuffer());

  let format: string | undefined;
  try {
    ({ format } = await sharp(input, { limitInputPixels: MAX_PIXELS }).metadata());
  } catch {
    throw new UploadError("Файл не похож на изображение");
  }
  if (!format || !ACCEPTED_FORMATS.has(format)) {
    throw new UploadError("Поддерживаются JPG, PNG, WebP, AVIF, HEIC и GIF");
  }

  const { data, info } = await sharp(input, {
    limitInputPixels: MAX_PIXELS,
    animated: false,
  })
    .rotate()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true });

  const filePath = storagePath(file.name);
  await storage.save(filePath, data, "image/webp");

  try {
    return await createMedia({
      path: filePath,
      originalName: file.name.slice(0, 200),
      mime: "image/webp",
      width: info.width,
      height: info.height,
      size: info.size,
      alt: alt.trim().slice(0, 300),
    });
  } catch (error) {
    await storage.remove(filePath);
    throw error;
  }
}
