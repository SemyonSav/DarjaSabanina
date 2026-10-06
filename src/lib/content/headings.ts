import type { JSONContent } from "@tiptap/core";
import { slugify } from "@/lib/slug";

export interface HeadingEntry {
  level: number;
  text: string;
  id: string;
}

function textOf(node: JSONContent): string {
  if (node.type === "text") return node.text ?? "";
  return (node.content ?? []).map(textOf).join("");
}

/**
 * Заголовки документа с уникальными якорями в порядке появления:
 * «Как это работает» → `#kak-eto-rabotaet`, повтор → `#kak-eto-rabotaet-2`.
 */
export function collectHeadings(doc: JSONContent): HeadingEntry[] {
  const used = new Map<string, number>();
  const headings: HeadingEntry[] = [];

  // Обход в глубину — в том же порядке, в каком рендерер выводит узлы
  const visit = (node: JSONContent) => {
    if (node.type !== "heading") {
      node.content?.forEach(visit);
      return;
    }
    const text = textOf(node).trim();
    const base = slugify(text) || "section";
    const count = (used.get(base) ?? 0) + 1;
    used.set(base, count);
    headings.push({
      level: Number(node.attrs?.level) || 2,
      text,
      id: count === 1 ? base : `${base}-${count}`,
    });
  };
  visit(doc);
  return headings;
}
