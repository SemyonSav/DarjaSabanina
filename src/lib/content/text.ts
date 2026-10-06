import type { JSONContent } from "@tiptap/core";

const BLOCK_TYPES = new Set([
  "paragraph",
  "heading",
  "blockquote",
  "listItem",
  "bulletList",
  "orderedList",
]);

/** Простой текст документа Tiptap: блоки разделены переводами строк */
export function documentToText(node: JSONContent): string {
  if (node.type === "text") return node.text ?? "";
  if (node.type === "hardBreak") return "\n";
  const inner = (node.content ?? []).map(documentToText).join("");
  return node.type && BLOCK_TYPES.has(node.type) ? `${inner}\n` : inner;
}

export function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

/** Средняя скорость чтения русского текста ~180 слов в минуту */
const WORDS_PER_MINUTE = 180;

export function readingTimeMinutes(doc: JSONContent): number {
  return Math.max(1, Math.round(countWords(documentToText(doc)) / WORDS_PER_MINUTE));
}
