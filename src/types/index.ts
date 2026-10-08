export type ArticleCategory =
  | "расстановки"
  | "тревога"
  | "отношения"
  | "психосоматика"
  | "саморазвитие";

export interface Article {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  coverImage: string;
  coverAlt: string;
  publishedAt: string;
  readingTimeMinutes: number;
  category: ArticleCategory;
  /** Markdown-like content blocks for CMS-ready structure */
  content: ArticleBlock[];
  featured?: boolean;
}

export type ArticleBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "quote"; text: string; author?: string }
  | { type: "list"; ordered?: boolean; items: string[] };

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

export interface NavItem {
  href: string;
  label: string;
}

