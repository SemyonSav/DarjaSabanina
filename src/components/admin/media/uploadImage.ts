import type { MediaImage } from "@/types";

export const ACCEPT_IMAGES =
  "image/jpeg,image/png,image/webp,image/avif,image/gif,image/heic,image/heif";

/** Загружает картинку в медиатеку и возвращает её данные */
export async function uploadImage(file: File, alt = ""): Promise<MediaImage> {
  const form = new FormData();
  form.append("file", file);
  form.append("alt", alt);

  const response = await fetch("/api/admin/media", { method: "POST", body: form });
  const data = (await response.json().catch(() => ({}))) as {
    media?: MediaImage;
    error?: string;
  };
  if (!response.ok || !data.media) {
    throw new Error(data.error ?? "Не удалось загрузить изображение");
  }
  return data.media;
}

export function imageFilesFrom(list: FileList | null | undefined): File[] {
  return Array.from(list ?? []).filter((file) => file.type.startsWith("image/"));
}
