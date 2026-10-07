import type { JSONContent } from "@tiptap/core";

/** Статичные статьи до переноса в БД (используются сид-скриптом) */
export type LegacyArticleCategory =
  | "расстановки"
  | "тревога"
  | "отношения"
  | "психосоматика"
  | "саморазвитие";

export interface LegacyArticle {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  coverImage: string;
  coverAlt: string;
  publishedAt: string;
  readingTimeMinutes: number;
  category: LegacyArticleCategory;
  content: LegacyArticleBlock[];
  featured?: boolean;
}

export type LegacyArticleBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "quote"; text: string; author?: string }
  | { type: "list"; ordered?: boolean; items: string[] };

export interface MediaImage {
  id: number;
  url: string;
  alt: string;
  width: number;
  height: number;
}

export interface Category {
  id: number;
  slug: string;
  name: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  sortOrder: number;
}

export type ArticleStatus = "draft" | "published";

export interface Article {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  /** meta description: SEO-описание или анонс */
  description: string;
  content: JSONContent;
  contentHtml: string;
  cover: MediaImage | null;
  ogImage: MediaImage | null;
  category: Category | null;
  status: ArticleStatus;
  featured: boolean;
  readingTimeMinutes: number;
  seoTitle: string;
  seoDescription: string;
  focusKeyword: string;
  keywords: string[];
  canonicalUrl: string;
  noindex: boolean;
  /** Есть автосохранённые, но не применённые правки */
  hasAutosave: boolean;
  /** ISO-дата */
  publishedAt: string | null;
  /** ISO-дата */
  updatedAt: string;
  createdAt: string;
}

/** Данные для карточки статьи — без тела, чтобы не гонять его в клиентские компоненты */
export type ArticleSummary = Pick<
  Article,
  "id" | "slug" | "title" | "excerpt" | "cover" | "category" | "publishedAt"
>;

export function toArticleSummary(article: Article): ArticleSummary {
  const { id, slug, title, excerpt, cover, category, publishedAt } = article;
  return { id, slug, title, excerpt, cover, category, publishedAt };
}

export interface Testimonial {
  id: string;
  name: string;
  text: string;
  role?: string;
}

export interface NavItem {
  href: string;
  label: string;
}

