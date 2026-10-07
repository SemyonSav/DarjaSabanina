import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { processAndStoreImage, UploadError } from "@/lib/media/upload";
import { toMediaImage } from "@/lib/repos/mappers";

/**
 * Загрузка изображения: multipart/form-data с полями `file` и `alt`.
 * Route handler вместо server action — у server actions лимит тела 1 МБ.
 */
export async function POST(request: Request) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Файл не передан" }, { status: 400 });
  }
  const alt = typeof form.get("alt") === "string" ? String(form.get("alt")) : "";

  try {
    const media = await processAndStoreImage(file, alt);
    return NextResponse.json({ media: toMediaImage(media) }, { status: 201 });
  } catch (error) {
    if (error instanceof UploadError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Ошибка загрузки изображения", error);
    return NextResponse.json(
      { error: "Не удалось загрузить изображение" },
      { status: 500 },
    );
  }
}
