import type { JSONContent } from "@tiptap/core";
import type { LegacyArticleBlock } from "@/types";

function textNode(text: string): JSONContent[] {
  return text ? [{ type: "text", text }] : [];
}

function paragraph(text: string): JSONContent {
  return { type: "paragraph", content: textNode(text) };
}

function blockToTiptap(block: LegacyArticleBlock): JSONContent {
  switch (block.type) {
    case "paragraph":
      return paragraph(block.text);
    case "heading":
      return {
        type: "heading",
        attrs: { level: block.level },
        content: textNode(block.text),
      };
    case "quote":
      return {
        type: "blockquote",
        content: [
          paragraph(block.text),
          ...(block.author ? [paragraph(`— ${block.author}`)] : []),
        ],
      };
    case "list":
      return {
        type: block.ordered ? "orderedList" : "bulletList",
        content: block.items.map((item) => ({
          type: "listItem",
          content: [paragraph(item)],
        })),
      };
  }
}

/** Старые блоки статьи → документ Tiptap */
export function legacyBlocksToTiptap(blocks: LegacyArticleBlock[]): JSONContent {
  return { type: "doc", content: blocks.map(blockToTiptap) };
}
