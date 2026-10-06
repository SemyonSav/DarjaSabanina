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
  /** ISO-дата */
  publishedAt: string | null;
  /** ISO-дата */
  updatedAt: string;
  createdAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  text: string;
  role?: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface RequestItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface Advantage {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface Direction {
  id: string;
  title: string;
  description: string;
}

export interface NavItem {
  href: string;
  label: string;
}

export interface ContactFormData {
  name: string;
  phone: string;
  email?: string;
  message?: string;
  format?: "online" | "offline";
}
