"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  EditorContent,
  useEditor,
  useEditorState,
  type Editor,
} from "@tiptap/react";
import { Extension, type JSONContent } from "@tiptap/core";
import { Placeholder } from "@tiptap/extensions";
import { ImagePlus, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getContentExtensions } from "@/lib/content/extensions";
import { cleanPastedHtml } from "@/lib/content/paste";
import { Toolbar, ToolbarButton } from "./Toolbar";
import { SelectionMenu } from "./SelectionMenu";
import { LinkDialog } from "./LinkDialog";
import { ImageDialog, type ImageDialogRequest } from "./ImageDialog";
import { imageFilesFrom } from "@/components/admin/media/uploadImage";

/**
 * Обычный JSON-клон документа. ProseMirror создаёт attrs без прототипа
 * (Object.create(null)), и React при передаче в server action их теряет —
 * например, у заголовков пропадал уровень.
 */
export function toPlainJSON(editor: Editor): JSONContent {
  return JSON.parse(JSON.stringify(editor.getJSON())) as JSONContent;
}

/** Горячие клавиши, которые открывают диалоги редактора */
const DialogShortcuts = Extension.create<{ onLink: () => void }>({
  name: "dialogShortcuts",
  addOptions() {
    return { onLink: () => {} };
  },
  addKeyboardShortcuts() {
    return {
      "Mod-k": () => {
        this.options.onLink();
        return true;
      },
    };
  },
});

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
}

function LinkButton({
  editor,
  onClick,
}: {
  editor: Editor;
  onClick: () => void;
}) {
  const active = useEditorState({
    editor,
    selector: ({ editor: e }) => e.isActive("link"),
  });
  return (
    <ToolbarButton
      icon={Link2}
      label="Ссылка"
      shortcut="Mod+K"
      active={active}
      onClick={onClick}
    />
  );
}

function ImageButton({
  editor,
  onClick,
}: {
  editor: Editor;
  onClick: (edit: boolean) => void;
}) {
  const selected = useEditorState({
    editor,
    selector: ({ editor: e }) => e.isActive("image"),
  });
  return (
    <ToolbarButton
      icon={ImagePlus}
      label={selected ? "Изменить изображение" : "Изображение"}
      active={selected}
      onClick={() => onClick(selected)}
    />
  );
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
}: RichTextEditorProps) {
  const [linkOpen, setLinkOpen] = useState(false);
  const openLink = useRef(() => setLinkOpen(true));
  const [imageRequest, setImageRequest] = useState<ImageDialogRequest | null>(
    null,
  );

  const extensions = useMemo(
    () => [
      ...getContentExtensions(),
      Placeholder.configure({ placeholder }),
      DialogShortcuts.configure({ onLink: () => openLink.current() }),
    ],
    [placeholder],
  );

  const editor = useEditor({
    extensions,
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose-article tiptap-content min-h-[24rem] px-5 py-4 outline-none md:px-8 md:py-6",
        "aria-label": "Текст статьи",
      },
      // Картинку, брошенную в текст, сначала загружаем и просим описать
      handleDrop: (view, event, _slice, moved) => {
        const [file] = imageFilesFrom(event.dataTransfer?.files);
        if (moved || !file) return false;
        event.preventDefault();
        const position = view.posAtCoords({
          left: event.clientX,
          top: event.clientY,
        })?.pos;
        setImageRequest({ file, position });
        return true;
      },
      transformPastedHTML: cleanPastedHtml,
      handlePaste: (_view, event) => {
        const [file] = imageFilesFrom(event.clipboardData?.files);
        if (!file) return false;
        event.preventDefault();
        setImageRequest({ file });
        return true;
      },
      handleDoubleClickOn: (_view, _pos, node) => {
        if (node.type.name !== "image") return false;
        setImageRequest({ edit: true });
        return true;
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
        "rounded-[0.9rem] border bg-background transition focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20",
        invalid ? "border-red-400" : "border-border",
      )}
    >
      {editor ? (
        <>
          <Toolbar editor={editor}>
            <LinkButton editor={editor} onClick={() => setLinkOpen(true)} />
            <ImageButton
              editor={editor}
              onClick={(edit) => setImageRequest(edit ? { edit } : {})}
            />
          </Toolbar>
          <SelectionMenu editor={editor}>
            <LinkButton editor={editor} onClick={() => setLinkOpen(true)} />
          </SelectionMenu>
          <LinkDialog
            editor={editor}
            open={linkOpen}
            onClose={() => setLinkOpen(false)}
          />
          <ImageDialog
            editor={editor}
            request={imageRequest}
            onClose={() => setImageRequest(null)}
          />
        </>
      ) : (
        <div className="h-[49px] rounded-t-[0.9rem] border-b border-border bg-card" />
      )}
      <EditorContent editor={editor} />
    </div>
  );
}
