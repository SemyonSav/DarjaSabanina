import { describe, expect, it } from "vitest";
import {
  articleDraftSchema,
  articleInputSchema,
  collectFieldErrors,
  parseKeywords,
  type ArticleInput,
} from "@/lib/validation/article";

const valid: ArticleInput = {
  title: "Тревога как сигнал",
  slug: "trevoga-kak-signal",
  categoryId: 1,
  excerpt: "Анонс",
  content: { type: "doc", content: [] },
  coverImageId: null,
  featured: false,
  seoTitle: "",
  seoDescription: "",
  focusKeyword: "тревога",
  keywords: [],
  canonicalUrl: "",
  noindex: false,
  ogImageId: null,
};

describe("articleInputSchema", () => {
  it("принимает корректную статью и обрезает пробелы", () => {
    const result = articleInputSchema.parse({ ...valid, title: "  Тревога  " });
    expect(result.title).toBe("Тревога");
  });

  it.each([
    [{ title: "" }, "title"],
    [{ slug: "Тревога" }, "slug"],
    [{ slug: "category" }, "slug"],
    [{ canonicalUrl: "example.ru/page" }, "canonicalUrl"],
    [{ canonicalUrl: "javascript:alert(1)" }, "canonicalUrl"],
    [{ content: { type: "paragraph" } }, "content"],
    [{ keywords: Array(21).fill("слово") }, "keywords"],
  ])("отклоняет %o", (patch, field) => {
    const result = articleInputSchema.safeParse({ ...valid, ...patch });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(collectFieldErrors(result.error)).toHaveProperty(field);
    }
  });

  it("принимает https canonical", () => {
    expect(
      articleInputSchema.safeParse({
        ...valid,
        canonicalUrl: "https://other.ru/original",
      }).success,
    ).toBe(true);
  });
});

describe("articleDraftSchema", () => {
  it("сохраняет незаконченную статью", () => {
    expect(
      articleDraftSchema.safeParse({ ...valid, title: "", slug: "" }).success,
    ).toBe(true);
  });
});

describe("parseKeywords", () => {
  it("разбивает по запятым и убирает повторы", () => {
    expect(parseKeywords("тревога, Тревога ,  паника,, ")).toEqual([
      "тревога",
      "паника",
    ]);
  });
});
