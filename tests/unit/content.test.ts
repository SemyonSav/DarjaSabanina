import { describe, expect, it } from "vitest";
import type { JSONContent } from "@tiptap/core";
import { legacyBlocksToTiptap } from "@/lib/content/legacy";
import { renderContentHtml } from "@/lib/content/html";
import { collectHeadings } from "@/lib/content/headings";
import { readingTimeMinutes } from "@/lib/content/text";
import { isOwnImageSrc } from "@/lib/content/figure-image";
import {
  buildLinkAttrs,
  isInternalHref,
  isSafeHref,
  normalizeHref,
} from "@/lib/content/links";
import { containsPhrase } from "@/lib/content/seo-checks";

const text = (value: string, marks?: JSONContent["marks"]): JSONContent => ({
  type: "text",
  text: value,
  ...(marks ? { marks } : {}),
});

describe("legacyBlocksToTiptap", () => {
  it("переводит старые блоки в документ Tiptap", () => {
    const doc = legacyBlocksToTiptap([
      { type: "heading", level: 2, text: "Заголовок" },
      { type: "paragraph", text: "Абзац" },
      { type: "quote", text: "Цитата", author: "Автор" },
      { type: "list", ordered: true, items: ["раз", "два"] },
    ]);
    expect(doc.type).toBe("doc");
    expect(doc.content?.map((n) => n.type)).toEqual([
      "heading",
      "paragraph",
      "blockquote",
      "orderedList",
    ]);
    expect(doc.content?.[0].attrs).toEqual({ level: 2 });
    expect(doc.content?.[2].content).toHaveLength(2);
    expect(doc.content?.[3].content).toHaveLength(2);
  });

  it("рендерится в HTML без потерь", () => {
    const html = renderContentHtml(
      legacyBlocksToTiptap([
        { type: "heading", level: 3, text: "Подзаголовок" },
        { type: "list", items: ["пункт"] },
      ]),
    );
    expect(html).toContain("<h3>Подзаголовок</h3>");
    expect(html).toContain("<ul><li><p>пункт</p></li></ul>");
  });
});

describe("renderContentHtml", () => {
  it("убирает небезопасные ссылки и чужие картинки", () => {
    const html = renderContentHtml({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            text("плохая", [
              { type: "link", attrs: { href: "javascript:alert(1)" } },
            ]),
            text(" и "),
            text("своя", [{ type: "link", attrs: { href: "/articles/x" } }]),
          ],
        },
        {
          type: "image",
          attrs: { src: "https://evil.example/x.png", alt: "чужая" },
        },
        {
          type: "image",
          attrs: {
            src: "/uploads/2026/10/a.webp",
            alt: 'Кавычки " и <теги>',
            width: 800,
            height: 600,
            caption: "Подпись",
          },
        },
      ],
    });
    expect(html).not.toContain("javascript:");
    expect(html).not.toContain("evil.example");
    expect(html).toContain('href="https://example.ru/articles/x"');
    expect(html).toContain('src="https://example.ru/uploads/2026/10/a.webp"');
    expect(html).toContain('alt="Кавычки &quot; и &lt;теги&gt;"');
    expect(html).toContain("<figcaption>Подпись</figcaption>");
  });
});

describe("collectHeadings", () => {
  it("выдаёт уникальные якоря в порядке документа", () => {
    const heading = (level: number, value: string): JSONContent => ({
      type: "heading",
      attrs: { level },
      content: [text(value)],
    });
    const headings = collectHeadings({
      type: "doc",
      content: [
        heading(2, "Как это работает"),
        heading(3, "Детали"),
        heading(2, "Как это работает"),
        { type: "blockquote", content: [heading(2, "")] },
      ],
    });
    expect(headings.map((h) => h.id)).toEqual([
      "kak-eto-rabotaet",
      "detali",
      "kak-eto-rabotaet-2",
      "section",
    ]);
  });
});

describe("readingTimeMinutes", () => {
  it("считает ~180 слов в минуту и не меньше минуты", () => {
    const paragraph = (words: number): JSONContent => ({
      type: "paragraph",
      content: [text(Array(words).fill("слово").join(" "))],
    });
    expect(readingTimeMinutes({ type: "doc", content: [] })).toBe(1);
    expect(readingTimeMinutes({ type: "doc", content: [paragraph(900)] })).toBe(
      5,
    );
  });
});

describe("ссылки", () => {
  it.each([
    ["https://who.int", true],
    ["/articles/x", true],
    ["mailto:a@b.ru", true],
    ["#section", true],
    ["javascript:alert(1)", false],
    ["//evil.example", false],
    ["data:text/html,x", false],
  ])("isSafeHref(%s) → %s", (href, safe) => {
    expect(isSafeHref(href)).toBe(safe);
  });

  it("дополняет адрес протоколом", () => {
    expect(normalizeHref("who.int/news")).toBe("https://who.int/news");
    expect(normalizeHref("hello@site.ru")).toBe("mailto:hello@site.ru");
    expect(normalizeHref("/articles/x")).toBe("/articles/x");
  });

  it("узнаёт внутренние ссылки", () => {
    expect(isInternalHref("/articles/x")).toBe(true);
    expect(isInternalHref("https://example.ru/privacy")).toBe(true);
    expect(isInternalHref("https://who.int")).toBe(false);
  });

  it("собирает rel для новой вкладки и nofollow", () => {
    expect(buildLinkAttrs("/x", { newTab: false, nofollow: false })).toEqual({
      href: "/x",
      target: null,
      rel: null,
    });
    expect(
      buildLinkAttrs("https://a.ru", { newTab: true, nofollow: true }),
    ).toEqual({
      href: "https://a.ru",
      target: "_blank",
      rel: "noopener noreferrer nofollow",
    });
  });
});

describe("isOwnImageSrc", () => {
  it("пропускает только картинки из своего хранилища", () => {
    expect(isOwnImageSrc("/uploads/2026/10/a.webp")).toBe(true);
    expect(isOwnImageSrc("/uploads/../site.db")).toBe(false);
    expect(isOwnImageSrc("https://evil.example/a.png")).toBe(false);
    expect(isOwnImageSrc(42)).toBe(false);
  });
});

describe("containsPhrase", () => {
  it("находит фразу с учётом окончаний", () => {
    expect(
      containsPhrase("Тревожность: причины и что делать", "тревога причины"),
    ).toBe(true);
    expect(
      containsPhrase(
        "Почему возникает тревога и её причины",
        "причина тревоги",
      ),
    ).toBe(true);
    expect(containsPhrase("Тревога как сигнал", "тревога причины")).toBe(false);
    expect(containsPhrase("что угодно", "")).toBe(false);
  });
});
