import { renderToReactElement } from "@tiptap/static-renderer/pm/react";
import type { JSONContent } from "@tiptap/core";
import { getContentExtensions } from "@/lib/content/extensions";

/** Серверный рендер документа Tiptap в семантический HTML */
export function ArticleBody({ content }: { content: JSONContent }) {
  return (
    <div className="prose-article">
      {renderToReactElement({ content, extensions: getContentExtensions() })}
    </div>
  );
}
