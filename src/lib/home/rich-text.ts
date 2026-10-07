import { z } from "zod";
import { isSafeHref } from "@/lib/content/links";

/**
 * Форматированный текст блоков главной: абзацы с выделениями
 * (жирный, курсив, подчёркнутый, зачёркнутый) и ссылками.
 * Формат — подмножество документа Tiptap, чтобы его правил тот же редактор.
 */

export const RICH_MARKS = [
  "bold",
  "italic",
  "underline",
  "strike",
  "link",
] as const;
export type RichMarkType = (typeof RICH_MARKS)[number];

export interface RichMark {
  type: RichMarkType;
  attrs?: { href: string; target?: string | null; rel?: string | null };
}

export type RichInline =
  { type: "text"; text: string; marks?: RichMark[] } | { type: "hardBreak" };

export interface RichParagraph {
  type: "paragraph";
  content?: RichInline[];
}

export interface RichDoc {
  type: "doc";
  content: RichParagraph[];
}

/** Обычная строка → документ: каждая строка — абзац */
export function richTextFromString(value: string): RichDoc {
  return {
    type: "doc",
    content: value
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => ({
        type: "paragraph",
        content: [{ type: "text", text: line }],
      })),
  };
}

type Node = {
  type?: unknown;
  text?: unknown;
  marks?: unknown;
  content?: unknown;
  attrs?: unknown;
};

function sanitizeMarks(marks: unknown): RichMark[] | undefined {
  if (!Array.isArray(marks)) return undefined;
  const result: RichMark[] = [];
  for (const mark of marks as Node[]) {
    const type = mark?.type as RichMarkType;
    if (!RICH_MARKS.includes(type) || result.some((m) => m.type === type))
      continue;
    if (type !== "link") {
      result.push({ type });
      continue;
    }
    const attrs = (mark.attrs ?? {}) as Record<string, unknown>;
    const href = typeof attrs.href === "string" ? attrs.href.trim() : "";
    if (!isSafeHref(href)) continue;
    result.push({
      type,
      attrs: {
        href,
        target: attrs.target === "_blank" ? "_blank" : null,
        rel:
          typeof attrs.rel === "string"
            ? attrs.rel.replace(/[^a-z ]/g, "") || null
            : null,
      },
    });
  }
  return result.length ? result : undefined;
}

/** Текст и переносы строки из любого узла (заголовки, списки — тоже) */
function collectInline(node: Node, out: RichInline[]) {
  if (node?.type === "text" && typeof node.text === "string" && node.text) {
    const marks = sanitizeMarks(node.marks);
    out.push(
      marks
        ? { type: "text", text: node.text, marks }
        : { type: "text", text: node.text },
    );
  } else if (node?.type === "hardBreak") {
    out.push({ type: "hardBreak" });
  } else if (Array.isArray(node?.content)) {
    for (const child of node.content as Node[]) collectInline(child, out);
  }
}

/** Блочные узлы, которые превращаются в отдельные абзацы */
function collectParagraphs(node: Node, out: RichParagraph[]) {
  const children = Array.isArray(node?.content) ? (node.content as Node[]) : [];
  const isTextBlock =
    children.length > 0 &&
    children.every((c) => c?.type === "text" || c?.type === "hardBreak");
  if (node?.type === "paragraph" || node?.type === "heading" || isTextBlock) {
    const content: RichInline[] = [];
    collectInline(node, content);
    // Переносы в начале и конце абзаца ничего не значат
    while (content[0]?.type === "hardBreak") content.shift();
    while (content.at(-1)?.type === "hardBreak") content.pop();
    if (content.length) out.push({ type: "paragraph", content });
    return;
  }
  for (const child of children) collectParagraphs(child, out);
}

/**
 * Оставляет в документе только разрешённое: абзацы, текст, переносы,
 * выделения и ссылки с безопасным адресом. Заголовки и списки из вставки
 * превращаются в абзацы.
 */
export function sanitizeRichDoc(value: unknown): RichDoc {
  const content: RichParagraph[] = [];
  if (value && typeof value === "object")
    collectParagraphs(value as Node, content);
  return { type: "doc", content };
}

export function richTextToPlain(doc: RichDoc): string {
  return doc.content
    .map((p) =>
      (p.content ?? [])
        .map((n) => (n.type === "text" ? n.text : "\n"))
        .join(""),
    )
    .join("\n");
}

export function isRichTextEmpty(doc: RichDoc): boolean {
  return richTextToPlain(doc).trim() === "";
}

/**
 * Схема поля с оформлением. Принимает документ или строку (содержимое
 * по умолчанию и сохранённое до появления оформления) и приводит к документу.
 */
export function richText(max = 5000) {
  return z
    .unknown()
    .transform((value) =>
      typeof value === "string"
        ? richTextFromString(value)
        : sanitizeRichDoc(value),
    )
    .refine(
      (doc) => richTextToPlain(doc).length <= max,
      `Не длиннее ${max} символов`,
    );
}
