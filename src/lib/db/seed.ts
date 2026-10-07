/**
 * Начальное наполнение БД: рубрики, статьи (с обложками) и отзывы,
 * которые раньше хранились в коде. Повторный запуск ничего не дублирует.
 * Запускается вручную (npm run db:seed) или при первом старте на пустой базе.
 */
import fs from "node:fs";
import path from "node:path";
import { eq, sql } from "drizzle-orm";
import { db, dataDir } from "./index";
import { articles, categories, media, testimonials } from "./schema";
import { legacyBlocksToTiptap } from "../content/legacy";
import { renderContentHtml } from "../content/html";
import { slugify } from "../slug";
import { legacyArticles, legacyTestimonials } from "./seed-data";

const uploadsDir = path.join(dataDir, "uploads");
const publicDir = path.resolve("public");

const categoryNames: Record<string, string> = {
  расстановки: "Расстановки",
  тревога: "Тревога",
  отношения: "Отношения",
  психосоматика: "Психосоматика",
  саморазвитие: "Саморазвитие",
};

function svgSize(svg: string): { width: number; height: number } {
  const width = Number(svg.match(/\bwidth="(\d+)/)?.[1]);
  const height = Number(svg.match(/\bheight="(\d+)/)?.[1]);
  return width && height ? { width, height } : { width: 1200, height: 750 };
}

/** Копирует картинку из public/ в хранилище и возвращает id записи media */
function importCover(publicPath: string, alt: string): number {
  const storagePath = `seed/${path.basename(publicPath)}`;
  const existing = db
    .select({ id: media.id })
    .from(media)
    .where(eq(media.path, storagePath))
    .get();
  if (existing) return existing.id;

  const source = path.join(publicDir, publicPath);
  const target = path.join(uploadsDir, storagePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);

  const { width, height } = svgSize(fs.readFileSync(source, "utf8"));
  const row = db
    .insert(media)
    .values({
      path: storagePath,
      originalName: path.basename(publicPath),
      mime: "image/svg+xml",
      width,
      height,
      size: fs.statSync(source).size,
      alt,
    })
    .returning({ id: media.id })
    .get();
  return row.id;
}

function seedCategories(): Map<string, number> {
  const ids = new Map<string, number>();
  Object.entries(categoryNames).forEach(([key, name], index) => {
    const slug = slugify(name);
    const row = db
      .insert(categories)
      .values({ slug, name, sortOrder: index })
      .onConflictDoUpdate({ target: categories.slug, set: { slug } })
      .returning({ id: categories.id })
      .get();
    ids.set(key, row.id);
  });
  return ids;
}

function seedArticles(categoryIds: Map<string, number>): number {
  let created = 0;
  for (const article of legacyArticles) {
    const exists = db
      .select({ id: articles.id })
      .from(articles)
      .where(eq(articles.slug, article.slug))
      .get();
    if (exists) continue;

    const publishedAt = new Date(article.publishedAt);
    const content = legacyBlocksToTiptap(article.content);
    db.insert(articles)
      .values({
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        seoDescription: article.description,
        content,
        contentHtml: renderContentHtml(content),
        coverImageId: importCover(article.coverImage, article.coverAlt),
        categoryId: categoryIds.get(article.category) ?? null,
        status: "published",
        featured: Boolean(article.featured),
        readingTime: article.readingTimeMinutes,
        publishedAt,
        createdAt: publishedAt,
        updatedAt: publishedAt,
      })
      .run();
    created++;
  }
  return created;
}

function seedTestimonials(): number {
  const hasAny = db.select({ id: testimonials.id }).from(testimonials).get();
  if (hasAny) return 0;
  legacyTestimonials.forEach((t, index) => {
    db.insert(testimonials)
      .values({
        name: t.name,
        text: t.text,
        role: t.role ?? "",
        sortOrder: index,
      })
      .run();
  });
  return legacyTestimonials.length;
}

/** HTML-кэш для статей, перенесённых до его появления */
function backfillContentHtml(): number {
  const rows = db
    .select({ id: articles.id, content: articles.content })
    .from(articles)
    .where(eq(articles.contentHtml, ""))
    .all();
  for (const row of rows) {
    db.update(articles)
      .set({
        contentHtml: renderContentHtml(row.content),
        updatedAt: sql`updated_at`,
      })
      .where(eq(articles.id, row.id))
      .run();
  }
  return rows.length;
}

export interface SeedResult {
  categories: number;
  articles: number;
  testimonials: number;
  backfilled: number;
}

export function seedDatabase(): SeedResult {
  return db.transaction(() => {
    const categoryIds = seedCategories();
    return {
      categories: categoryIds.size,
      articles: seedArticles(categoryIds),
      testimonials: seedTestimonials(),
      backfilled: backfillContentHtml(),
    };
  });
}

/** База ещё ни разу не наполнялась */
export function isDatabaseEmpty(): boolean {
  return (
    !db.select({ id: categories.id }).from(categories).get() &&
    !db.select({ id: articles.id }).from(articles).get()
  );
}
