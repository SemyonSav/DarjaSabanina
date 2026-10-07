import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// Отдельная временная база: DATA_DIR читается при импорте модуля БД
const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "psy-test-"));
process.env.DATA_DIR = dataDir;

const { runMigrations } = await import("@/lib/db/migrate");
const { sqlite } = await import("@/lib/db");
const repos = await import("@/lib/repos");
const { seedDatabase, isDatabaseEmpty } = await import("@/lib/db/seed");

beforeAll(() => runMigrations());
afterAll(() => {
  sqlite.close();
  fs.rmSync(dataDir, { recursive: true, force: true });
});

describe("первичное наполнение", () => {
  it("переносит статьи один раз", () => {
    expect(isDatabaseEmpty()).toBe(true);
    const first = seedDatabase();
    expect(first.articles).toBeGreaterThan(0);
    expect(seedDatabase().articles).toBe(0);
    expect(isDatabaseEmpty()).toBe(false);
  });
});

describe("статьи", () => {
  it("публичные запросы не видят черновики", async () => {
    const id = await repos.createArticle({
      slug: "chernovik",
      title: "Черновик",
      status: "draft",
    });
    expect(await repos.getPublishedArticleBySlug("chernovik")).toBeNull();
    expect((await repos.getArticleById(id))?.status).toBe("draft");
    await repos.deleteArticle(id);
  });

  it("ищет без учёта регистра, в том числе по-русски", async () => {
    const found = await repos.listArticlesForAdmin({ search: "ТРЕВОГ" });
    expect(found.map((a) => a.slug)).toContain("trevoga-kak-signal");
    expect(await repos.listArticlesForAdmin({ search: "%" })).toHaveLength(0);
  });

  it("похожие статьи — сначала из той же рубрики, без самой статьи", async () => {
    const article = await repos.getPublishedArticleBySlug("trevoga-kak-signal");
    const related = await repos.listRelatedArticles(article!, 3);
    expect(related.map((a) => a.id)).not.toContain(article!.id);
    expect(related.length).toBeGreaterThan(0);
  });
});

describe("редиректы", () => {
  it("не строит цепочек и освобождает адрес", async () => {
    await repos.addRedirect("/articles/a", "/articles/b");
    await repos.addRedirect("/articles/b", "/articles/c");
    expect(await repos.findRedirect("/articles/a")).toBe("/articles/c");
    expect(await repos.findRedirect("/articles/b")).toBe("/articles/c");

    // Статью вернули на адрес b — редирект с него больше не нужен
    await repos.addRedirect("/articles/c", "/articles/b");
    expect(await repos.findRedirect("/articles/b")).toBeNull();
    expect(await repos.findRedirect("/articles/a")).toBe("/articles/b");

    await repos.removeRedirectsTo("/articles/b");
    expect(await repos.findRedirect("/articles/a")).toBeNull();
  });
});

describe("отзывы", () => {
  it("сохраняют порядок и скрываются с сайта", async () => {
    const all = await repos.listTestimonialsForAdmin();
    const reversed = all.map((t) => t.id).reverse();
    await repos.reorderTestimonials(reversed);
    expect((await repos.listTestimonialsForAdmin()).map((t) => t.id)).toEqual(
      reversed,
    );

    await repos.updateTestimonial(reversed[0], { isPublished: false });
    const published = await repos.listPublishedTestimonials();
    expect(published.map((t) => t.id)).not.toContain(String(reversed[0]));
  });
});
