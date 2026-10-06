import type { ArticleRow, CategoryRow, MediaRow } from "@/lib/db/schema";
import type { Article, Category, MediaImage } from "@/types";

export function mediaUrl(path: string): string {
  return `/uploads/${path}`;
}

export function toMediaImage(
  row: MediaRow | null | undefined,
): MediaImage | null {
  if (!row) return null;
  return {
    id: row.id,
    url: mediaUrl(row.path),
    alt: row.alt,
    width: row.width,
    height: row.height,
  };
}

export function toCategory(
  row: CategoryRow | null | undefined,
): Category | null {
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    sortOrder: row.sortOrder,
  };
}

export type ArticleWithRelations = ArticleRow & {
  category: CategoryRow | null;
  cover: MediaRow | null;
  ogImage: MediaRow | null;
};

export function toArticle(row: ArticleWithRelations): Article {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    description: row.seoDescription || row.excerpt,
    content: row.content,
    contentHtml: row.contentHtml,
    cover: toMediaImage(row.cover),
    ogImage: toMediaImage(row.ogImage),
    category: toCategory(row.category),
    status: row.status,
    featured: row.featured,
    readingTimeMinutes: row.readingTime,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    focusKeyword: row.focusKeyword,
    keywords: row.keywords,
    canonicalUrl: row.canonicalUrl,
    noindex: row.noindex,
    hasAutosave: row.autosave != null,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    updatedAt: row.updatedAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
  };
}
