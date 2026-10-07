import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  isRichTextEmpty,
  richText,
  richTextFromString,
  richTextToPlain,
  sanitizeRichDoc,
  type RichDoc,
} from "@/lib/home/rich-text";
import { RichText } from "@/components/ui/RichText";

const text = (value: string, marks?: unknown[]) => ({
  type: "text",
  text: value,
  ...(marks ? { marks } : {}),
});

describe("sanitizeRichDoc", () => {
  it("оставляет абзацы, выделения и безопасные ссылки", () => {
    const doc = sanitizeRichDoc({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            text("жирный", [{ type: "bold" }, { type: "bold" }]),
            text(" "),
            text("ссылка", [
              {
                type: "link",
                attrs: {
                  href: "https://who.int",
                  target: "_blank",
                  rel: "noopener",
                  class: "x",
                },
              },
            ]),
            text(" "),
            text("опасная", [
              { type: "link", attrs: { href: "javascript:alert(1)" } },
            ]),
            text(" "),
            text("код", [{ type: "code" }]),
          ],
        },
      ],
    });
    const [paragraph] = doc.content;
    expect(paragraph.content?.[0]).toEqual(text("жирный", [{ type: "bold" }]));
    expect(paragraph.content?.[2]).toEqual(
      text("ссылка", [
        {
          type: "link",
          attrs: { href: "https://who.int", target: "_blank", rel: "noopener" },
        },
      ]),
    );
    expect(paragraph.content?.[4]).toEqual(text("опасная"));
    expect(paragraph.content?.[6]).toEqual(text("код"));
  });

  it("превращает заголовки и списки в абзацы, отбрасывает картинки", () => {
    const doc = sanitizeRichDoc({
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 2 }, content: [text("Заголовок")] },
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [{ type: "paragraph", content: [text("пункт")] }],
            },
          ],
        },
        { type: "image", attrs: { src: "/uploads/a.webp" } },
        { type: "paragraph" },
      ],
    });
    expect(richTextToPlain(doc)).toBe("Заголовок\nпункт");
  });

  it("не падает на мусоре", () => {
    expect(sanitizeRichDoc("строка")).toEqual({ type: "doc", content: [] });
    expect(sanitizeRichDoc(null)).toEqual({ type: "doc", content: [] });
    expect(
      isRichTextEmpty(sanitizeRichDoc({ type: "doc", content: [{}] })),
    ).toBe(true);
  });
});

describe("схема richText", () => {
  it("принимает строку и документ", () => {
    expect(richText().parse("Раз\nДва")).toEqual(
      richTextFromString("Раз\nДва"),
    );
    const doc: RichDoc = {
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "текст" }] },
      ],
    };
    expect(richText().parse(doc)).toEqual(doc);
  });

  it("ограничивает длину по тексту, а не по разметке", () => {
    expect(richText(5).safeParse("12345").success).toBe(true);
    expect(richText(5).safeParse("123456").success).toBe(false);
  });
});

describe("<RichText>", () => {
  it("выводит абзацы с оформлением", () => {
    const html = renderToStaticMarkup(
      <RichText
        value={{
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Жирный",
                  marks: [{ type: "bold" }, { type: "italic" }],
                },
                { type: "hardBreak" },
                {
                  type: "text",
                  text: "ссылка",
                  marks: [{ type: "link", attrs: { href: "/x" } }],
                },
              ],
            },
            {
              type: "paragraph",
              content: [{ type: "text", text: "<script>" }],
            },
          ],
        }}
        paragraphClassName="p"
        prefix="Начало. "
      />,
    );
    expect(html).toContain(
      '<p class="p">Начало. <em><strong class="font-semibold">Жирный</strong></em><br/>',
    );
    expect(html).toContain('<a href="/x"');
    expect(html).toContain("&lt;script&gt;");
  });

  it("не выводит небезопасную ссылку", () => {
    const html = renderToStaticMarkup(
      <RichText
        value={{
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "плохая",
                  marks: [{ type: "link", attrs: { href: "javascript:1" } }],
                },
              ],
            },
          ],
        }}
      />,
    );
    expect(html).toBe("<p>плохая</p>");
  });
});
