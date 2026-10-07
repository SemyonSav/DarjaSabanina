"use client";

import type { JSONContent } from "@tiptap/core";
import { RichTextEditor } from "@/components/admin/editor/RichTextEditor";

export function ContentField({
  value,
  onChange,
  onReady,
  error,
}: {
  value: JSONContent;
  onChange: (value: JSONContent) => void;
  onReady?: (value: JSONContent) => void;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium">Текст статьи</p>
      <RichTextEditor
        value={value}
        onChange={onChange}
        onReady={onReady}
        invalid={Boolean(error)}
      />
      {error ? (
        <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Заголовок статьи (H1) задаётся выше — в тексте используйте
          подзаголовки H2–H4.
        </p>
      )}
    </div>
  );
}
