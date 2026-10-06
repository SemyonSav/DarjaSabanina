"use client";

import type { JSONContent } from "@tiptap/core";

/** Текст статьи. Редактор подключается в задаче 4.1 */
export function ContentField({
  error,
}: {
  value: JSONContent;
  onChange: (value: JSONContent) => void;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium">Текст статьи</p>
      <div className="rounded-[0.9rem] border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
        Редактор текста появится на следующем этапе.
      </div>
      {error ? (
        <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
      ) : null}
    </div>
  );
}
