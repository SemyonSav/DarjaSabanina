import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { JSONContent } from "@tiptap/core";
import type { ArticleInput } from "@/lib/validation/article";

const timestamps = {
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
};

export const media = sqliteTable("media", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  /** Путь внутри хранилища, например `2026/10/abc123.webp` */
  path: text("path").notNull().unique(),
  originalName: text("original_name").notNull().default(""),
  mime: text("mime").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  size: integer("size").notNull(),
  alt: text("alt").notNull().default(""),
  createdAt: timestamps.createdAt,
});

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  seoTitle: text("seo_title").notNull().default(""),
  seoDescription: text("seo_description").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});

export const articleStatuses = ["draft", "published"] as const;
export type ArticleStatus = (typeof articleStatuses)[number];

/** Несохранённое состояние формы, которое пишет автосохранение */
export type ArticleAutosave = ArticleInput;

export const articles = sqliteTable(
  "articles",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    excerpt: text("excerpt").notNull().default(""),
    /** Документ Tiptap */
    content: text("content", { mode: "json" })
      .$type<JSONContent>()
      .notNull()
      .default(sql`'{"type":"doc","content":[]}'`),
    /** Кэш отрендеренного HTML для публичной страницы */
    contentHtml: text("content_html").notNull().default(""),
    coverImageId: integer("cover_image_id").references(() => media.id, {
      onDelete: "set null",
    }),
    categoryId: integer("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    status: text("status", { enum: articleStatuses })
      .notNull()
      .default("draft"),
    featured: integer("featured", { mode: "boolean" }).notNull().default(false),
    readingTime: integer("reading_time").notNull().default(1),
    seoTitle: text("seo_title").notNull().default(""),
    seoDescription: text("seo_description").notNull().default(""),
    focusKeyword: text("focus_keyword").notNull().default(""),
    keywords: text("keywords", { mode: "json" })
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'`),
    ogImageId: integer("og_image_id").references(() => media.id, {
      onDelete: "set null",
    }),
    canonicalUrl: text("canonical_url").notNull().default(""),
    noindex: integer("noindex", { mode: "boolean" }).notNull().default(false),
    publishedAt: integer("published_at", { mode: "timestamp" }),
    autosave: text("autosave", { mode: "json" }).$type<ArticleAutosave>(),
    autosavedAt: integer("autosaved_at", { mode: "timestamp" }),
    ...timestamps,
  },
  (t) => [
    index("articles_status_published_idx").on(t.status, t.publishedAt),
    index("articles_category_idx").on(t.categoryId),
  ],
);

export const testimonials = sqliteTable("testimonials", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  text: text("text").notNull(),
  role: text("role").notNull().default(""),
  isPublished: integer("is_published", { mode: "boolean" })
    .notNull()
    .default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});

/** 301-редиректы, например после смены slug опубликованной статьи */
export const redirects = sqliteTable("redirects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  fromPath: text("from_path").notNull().unique(),
  toPath: text("to_path").notNull(),
  createdAt: timestamps.createdAt,
});

export type MediaRow = typeof media.$inferSelect;
export type CategoryRow = typeof categories.$inferSelect;
export type ArticleRow = typeof articles.$inferSelect;
export type NewArticleRow = typeof articles.$inferInsert;
export type TestimonialRow = typeof testimonials.$inferSelect;
export type RedirectRow = typeof redirects.$inferSelect;

export const articlesRelations = relations(articles, ({ one }) => ({
  category: one(categories, {
    fields: [articles.categoryId],
    references: [categories.id],
  }),
  cover: one(media, {
    fields: [articles.coverImageId],
    references: [media.id],
    relationName: "cover",
  }),
  ogImage: one(media, {
    fields: [articles.ogImageId],
    references: [media.id],
    relationName: "ogImage",
  }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  articles: many(articles),
}));

/** Редактируемые блоки главной и общие настройки сайта (JSON по ключу) */
export const siteBlocks = sqliteTable("site_blocks", {
  key: text("key").primaryKey(),
  data: text("data", { mode: "json" }).$type<unknown>().notNull(),
  updatedAt: timestamps.updatedAt,
});
