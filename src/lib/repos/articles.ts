import { and, asc, count, desc, eq, ne, or, sql, type SQL } from "drizzle-orm";
import type { SQLiteColumn } from "drizzle-orm/sqlite-core";
import { db } from "@/lib/db";
import { readingTimeMinutes } from "@/lib/content/text";
import {
  articles,
  categories,
  media,
  type ArticleStatus,
  type NewArticleRow,
} from "@/lib/db/schema";
import type { Article } from "@/types";
import { toArticle } from "./mappers";

/** Поиск подстроки без учёта регистра, в том числе для кириллицы */
function containsIgnoreCase(columns: SQLiteColumn[], query: string): SQL {
  // Символы % и _ в запросе ищем буквально
  const escaped = query.toLocaleLowerCase("ru").replace(/[!%_]/g, "!$&");
  const pattern = `%${escaped}%`;
  return or(
    ...columns.map(
      (column) => sql`unicode_lower(${column}) like ${pattern} escape '!'`,
    ),
  )!;
}

const withRelations = { category: true, cover: true, ogImage: true } as const;

const isPublished = eq(articles.status, "published");

const newestFirst = [desc(articles.publishedAt), desc(articles.id)];

// ——— Публичная часть: только опубликованные статьи ———

export async function listPublishedArticles(
  options: { categoryId?: number; limit?: number; offset?: number } = {},
): Promise<Article[]> {
  const rows = await db.query.articles.findMany({
    with: withRelations,
    where: options.categoryId
      ? and(isPublished, eq(articles.categoryId, options.categoryId))
      : isPublished,
    orderBy: newestFirst,
    limit: options.limit,
    offset: options.offset,
  });
  return rows.map(toArticle);
}

export async function countPublishedArticles(
  categoryId?: number,
): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(articles)
    .where(
      categoryId
        ? and(isPublished, eq(articles.categoryId, categoryId))
        : isPublished,
    );
  return row?.value ?? 0;
}

export async function getPublishedArticleBySlug(
  slug: string,
): Promise<Article | null> {
  const row = await db.query.articles.findFirst({
    with: withRelations,
    where: and(isPublished, eq(articles.slug, slug)),
  });
  return row ? toArticle(row) : null;
}

/** Статьи «на главной»; если отмеченных нет — просто свежие */
export async function listFeaturedArticles(limit = 3): Promise<Article[]> {
  const featured = await db.query.articles.findMany({
    with: withRelations,
    where: and(isPublished, eq(articles.featured, true)),
    orderBy: newestFirst,
    limit,
  });
  if (featured.length) return featured.map(toArticle);
  return listPublishedArticles({ limit });
}

/** Сначала статьи той же рубрики, затем остальные свежие */
export async function listRelatedArticles(
  article: Pick<Article, "id" | "category">,
  limit = 3,
): Promise<Article[]> {
  const notSelf = and(isPublished, ne(articles.id, article.id));
  const sameCategory = article.category
    ? await db.query.articles.findMany({
        with: withRelations,
        where: and(notSelf, eq(articles.categoryId, article.category.id)),
        orderBy: newestFirst,
        limit,
      })
    : [];
  if (sameCategory.length >= limit) return sameCategory.map(toArticle);

  const taken = new Set(sameCategory.map((a) => a.id));
  const rest = await db.query.articles.findMany({
    with: withRelations,
    where: notSelf,
    orderBy: newestFirst,
    limit: limit + taken.size,
  });
  return [...sameCategory, ...rest.filter((a) => !taken.has(a.id))]
    .slice(0, limit)
    .map(toArticle);
}

export async function listPublishedSlugs(): Promise<
  { slug: string; updatedAt: Date }[]
> {
  return db
    .select({ slug: articles.slug, updatedAt: articles.updatedAt })
    .from(articles)
    .where(isPublished)
    .orderBy(...newestFirst);
}

// ——— Админка ———

export type AdminArticleSort = "updated" | "published" | "title";

export async function listArticlesForAdmin(
  filters: {
    search?: string;
    status?: ArticleStatus;
    categoryId?: number;
    sort?: AdminArticleSort;
  } = {},
): Promise<Article[]> {
  const conditions: SQL[] = [];
  if (filters.search) {
    conditions.push(
      containsIgnoreCase([articles.title, articles.slug], filters.search),
    );
  }
  if (filters.status) conditions.push(eq(articles.status, filters.status));
  if (filters.categoryId) {
    conditions.push(eq(articles.categoryId, filters.categoryId));
  }

  const orderBy = {
    updated: [desc(articles.updatedAt)],
    published: newestFirst,
    title: [asc(articles.title)],
  }[filters.sort ?? "updated"];

  const rows = await db.query.articles.findMany({
    with: withRelations,
    where: conditions.length ? and(...conditions) : undefined,
    orderBy,
  });
  return rows.map(toArticle);
}

export async function getArticleById(id: number): Promise<Article | null> {
  const row = await db.query.articles.findFirst({
    with: withRelations,
    where: eq(articles.id, id),
  });
  return row ? toArticle(row) : null;
}

export async function getArticleRowById(id: number) {
  return (
    (await db.query.articles.findFirst({ where: eq(articles.id, id) })) ?? null
  );
}

export async function isArticleSlugTaken(slug: string, excludeId?: number) {
  const row = await db.query.articles.findFirst({
    columns: { id: true },
    where: excludeId
      ? and(eq(articles.slug, slug), ne(articles.id, excludeId))
      : eq(articles.slug, slug),
  });
  return Boolean(row);
}

export async function createArticle(data: NewArticleRow): Promise<number> {
  const [row] = await db
    .insert(articles)
    .values(data)
    .returning({ id: articles.id });
  return row.id;
}

export async function updateArticle(
  id: number,
  data: Partial<Omit<NewArticleRow, "id" | "createdAt">>,
): Promise<void> {
  await db.update(articles).set(data).where(eq(articles.id, id));
}

export async function deleteArticle(id: number): Promise<void> {
  await db.delete(articles).where(eq(articles.id, id));
}

export async function countArticlesByCategory(): Promise<Map<number, number>> {
  const rows = await db
    .select({ categoryId: categories.id, value: count(articles.id) })
    .from(categories)
    .leftJoin(articles, eq(articles.categoryId, categories.id))
    .groupBy(categories.id);
  return new Map(rows.map((r) => [r.categoryId, r.value]));
}

/**
 * Статья для предпросмотра: поверх сохранённой версии накладываются
 * автосохранённые правки, если они есть.
 */
export async function getArticlePreview(id: number): Promise<Article | null> {
  const row = await db.query.articles.findFirst({
    with: withRelations,
    where: eq(articles.id, id),
  });
  if (!row) return null;
  const draft = row.autosave;
  if (!draft) return toArticle(row);

  const [category, cover, ogImage] = await Promise.all([
    draft.categoryId
      ? db.query.categories.findFirst({
          where: eq(categories.id, draft.categoryId),
        })
      : null,
    draft.coverImageId
      ? db.query.media.findFirst({ where: eq(media.id, draft.coverImageId) })
      : null,
    draft.ogImageId
      ? db.query.media.findFirst({ where: eq(media.id, draft.ogImageId) })
      : null,
  ]);

  return toArticle({
    ...row,
    ...draft,
    readingTime: readingTimeMinutes(draft.content),
    category: category ?? null,
    cover: cover ?? null,
    ogImage: ogImage ?? null,
  });
}
