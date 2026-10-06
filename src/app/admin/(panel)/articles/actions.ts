"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import {
  addRedirect,
  createArticle,
  deleteArticle,
  getArticleRowById,
  isArticleSlugTaken,
  removeRedirectFrom,
  removeRedirectsTo,
  updateArticle,
} from "@/lib/repos";
import { readingTimeMinutes } from "@/lib/content/text";
import {
  articleInputSchema,
  collectFieldErrors,
  type ArticleInput,
  type FieldErrors,
} from "@/lib/validation/article";

export type SaveIntent = "save" | "publish" | "unpublish";

export type SaveResult =
  | { ok: true; id: number }
  | { ok: false; message: string; errors?: FieldErrors };

const articlePath = (slug: string) => `/articles/${slug}`;

function refreshPages() {
  // Публичные страницы рендерятся на каждый запрос; сбрасываем клиентский кэш
  revalidatePath("/", "layout");
}

export async function saveArticle(
  id: number | null,
  input: ArticleInput,
  intent: SaveIntent,
): Promise<SaveResult> {
  await requireAdmin();

  const parsed = articleInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Проверьте поля формы",
      errors: collectFieldErrors(parsed.error),
    };
  }
  const data = parsed.data;

  const existing = id ? await getArticleRowById(id) : null;
  if (id && !existing) return { ok: false, message: "Статья не найдена" };

  if (await isArticleSlugTaken(data.slug, id ?? undefined)) {
    return {
      ok: false,
      message: "Проверьте поля формы",
      errors: { slug: "Такой адрес уже занят другой статьёй" },
    };
  }

  const wasPublished = existing?.status === "published";
  const status =
    intent === "publish"
      ? "published"
      : intent === "unpublish"
        ? "draft"
        : (existing?.status ?? "draft");

  const values = {
    ...data,
    status,
    readingTime: readingTimeMinutes(data.content),
    publishedAt:
      status === "published"
        ? (existing?.publishedAt ?? new Date())
        : (existing?.publishedAt ?? null),
    // Явное сохранение применяет все правки — автосохранение больше не нужно
    autosave: null,
    autosavedAt: null,
  };

  try {
    let savedId: number;
    if (existing) {
      await updateArticle(existing.id, values);
      savedId = existing.id;
      // Старый адрес опубликованной статьи уже мог попасть в поиск
      if (wasPublished && existing.slug !== data.slug) {
        await addRedirect(articlePath(existing.slug), articlePath(data.slug));
      }
    } else {
      savedId = await createArticle(values);
    }
    // Адрес снова принадлежит живой статье
    await removeRedirectFrom(articlePath(data.slug));
    refreshPages();
    return { ok: true, id: savedId };
  } catch (error) {
    console.error("Не удалось сохранить статью", error);
    return { ok: false, message: "Не удалось сохранить статью. Попробуйте ещё раз." };
  }
}

export async function deleteArticleAction(id: number): Promise<SaveResult> {
  await requireAdmin();
  const existing = await getArticleRowById(id);
  if (!existing) return { ok: false, message: "Статья не найдена" };
  await deleteArticle(id);
  await removeRedirectsTo(articlePath(existing.slug));
  refreshPages();
  return { ok: true, id };
}
