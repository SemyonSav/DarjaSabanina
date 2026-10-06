"use client";

import { useEffect, useMemo } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import { Placeholder } from "@tiptap/extensions";
import type { JSONContent } from "@tiptap/core";
import { cn } from "@/lib/utils";
import { getContentExtensions } from "@/lib/content/extensions";

/**
 * Обычный JSON-клон документа. ProseMirror создаёт attrs без прототипа
 * (Object.create(null)), и React при передаче в server action их теряет —
 * например, у заголовков пропадал уровень.
 */
export function toPlainJSON(editor: Editor): JSONContent {
  return JSON.parse(JSON.stringify(editor.getJSON())) as JSONContent;
}

export interface RichTextEditorProps {
  value: JSONContent;
  onChange: (value: JSONContent) => void;
  /**
   * Документ после загрузки в редактор: ProseMirror дописывает атрибуты
   * по умолчанию, и без этого исходный текст выглядел бы изменённым
   */
  onReady?: (normalized: JSONContent) => void;
  placeholder?: string;
  invalid?: boolean;
  /** Панель инструментов и прочие элементы поверх редактора */
  renderToolbar?: (editor: Editor) => React.ReactNode;
}

/**
 * WYSIWYG-редактор статьи. Набор узлов совпадает с рендером на сайте
 * (getContentExtensions), стили контента — те же `.prose-article`.
 */
export function RichTextEditor({
  value,
  onChange,
  onReady,
  placeholder = "Начните писать статью…",
  invalid,
  renderToolbar,
}: RichTextEditorProps) {
  const extensions = useMemo(
    () => [...getContentExtensions(), Placeholder.configure({ placeholder })],
    [placeholder],
  );

  const editor = useEditor({
    extensions,
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose-article tiptap-content min-h-[24rem] px-5 py-4 outline-none md:px-8 md:py-6",
        "aria-label": "Текст статьи",
      },
    },
    onCreate: ({ editor }) => onReady?.(toPlainJSON(editor)),
    onUpdate: ({ editor }) => onChange(toPlainJSON(editor)),
  });

  // Значение заменили снаружи (например, восстановили черновик)
  useEffect(() => {
    if (!editor) return;
    if (JSON.stringify(toPlainJSON(editor)) !== JSON.stringify(value)) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[0.9rem] border bg-background transition focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20",
        invalid ? "border-red-400" : "border-border",
      )}
    >
      {editor && renderToolbar ? renderToolbar(editor) : null}
      <EditorContent editor={editor} />
    </div>
  );
}
