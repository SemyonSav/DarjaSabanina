"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import {
  addRedirect,
  createArticle,
  deleteArticle,
  getArticleRowById,
  isArticleSlugTaken,
  listArticlesForAdmin,
  removeRedirectFrom,
  removeRedirectsTo,
  updateArticle,
} from "@/lib/repos";
import { readingTimeMinutes } from "@/lib/content/text";
import {
  articleDraftSchema,
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

export async function autosaveArticle(
  id: number,
  input: ArticleInput,
): Promise<{ ok: boolean; savedAt?: string }> {
  await requireAdmin();
  const parsed = articleDraftSchema.safeParse(input);
  const existing = await getArticleRowById(id);
  if (!parsed.success || !existing) return { ok: false };

  const savedAt = new Date();
  await updateArticle(id, {
    autosave: parsed.data,
    autosavedAt: savedAt,
    // Автосохранение — не изменение статьи: dateModified и sitemap не трогаем
    updatedAt: existing.updatedAt,
  });
  return { ok: true, savedAt: savedAt.toISOString() };
}

export async function discardAutosave(id: number): Promise<void> {
  await requireAdmin();
  const existing = await getArticleRowById(id);
  if (!existing) return;
  await updateArticle(id, {
    autosave: null,
    autosavedAt: null,
    updatedAt: existing.updatedAt,
  });
}

/** Опубликованные статьи для внутренней ссылки из редактора */
export async function searchArticlesForLink(
  query: string,
): Promise<{ title: string; slug: string }[]> {
  await requireAdmin();
  const articles = await listArticlesForAdmin({
    search: query.trim().slice(0, 100) || undefined,
    status: "published",
    sort: "published",
  });
  return articles.slice(0, 8).map(({ title, slug }) => ({ title, slug }));
}
