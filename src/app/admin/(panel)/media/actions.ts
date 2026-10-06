"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import {
  deleteMedia,
  findMediaUsage,
  getMediaById,
  listMedia,
  updateMediaAlt,
} from "@/lib/repos";
import { toMediaImage } from "@/lib/repos/mappers";
import { storage } from "@/lib/storage";
import type { MediaImage } from "@/types";

export interface MediaItem extends MediaImage {
  originalName: string;
  size: number;
  createdAt: string;
}

export async function listMediaAction(): Promise<MediaItem[]> {
  await requireAdmin();
  const rows = await listMedia();
  return rows.map((row) => ({
    ...toMediaImage(row)!,
    originalName: row.originalName,
    size: row.size,
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function updateMediaAltAction(
  id: number,
  alt: string,
): Promise<{ ok: boolean }> {
  await requireAdmin();
  await updateMediaAlt(id, alt.trim().slice(0, 300));
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteMediaAction(
  id: number,
): Promise<{ ok: true } | { ok: false; message: string }> {
  await requireAdmin();
  const row = await getMediaById(id);
  if (!row) return { ok: false, message: "Файл не найден" };

  const usage = await findMediaUsage(row);
  if (usage.length) {
    const titles = usage.map((a) => `«${a.title}»`).join(", ");
    return {
      ok: false,
      message: `Изображение используется в статьях: ${titles}. Сначала уберите его оттуда.`,
    };
  }

  await deleteMedia(id);
  await storage.remove(row.path);
  revalidatePath("/admin/media");
  return { ok: true };
}
