"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  EditorContent,
  useEditor,
  useEditorState,
  type Editor,
} from "@tiptap/react";
import { Extension } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extensions";
import {
  Bold,
  Italic,
  Link2,
  RemoveFormatting,
  Strikethrough,
  Underline,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { cleanPastedHtml } from "@/lib/content/paste";
import type { RichDoc } from "@/lib/home/rich-text";
import { ToolbarButton } from "./Toolbar";
import { LinkDialog } from "./LinkDialog";
import { toPlainJSON } from "./RichTextEditor";

const EMPTY_DOC: RichDoc = { type: "doc", content: [{ type: "paragraph" }] };

/** Ctrl+K — диалог ссылки */
const LinkShortcut = Extension.create<{ onLink: () => void }>({
  name: "inlineLinkShortcut",
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

function InlineToolbar({
  editor,
  onLink,
}: {
  editor: Editor;
  onLink: () => void;
}) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      strike: e.isActive("strike"),
      link: e.isActive("link"),
    }),
  });
  const chain = () => editor.chain().focus();
  return (
    <div
      role="toolbar"
      aria-label="Оформление текста"
      className="flex flex-wrap items-center gap-0.5 rounded-t-[0.9rem] border-b border-border bg-card px-1.5 py-1"
    >
      <ToolbarButton
        icon={Bold}
        label="Жирный"
        shortcut="Mod+B"
        active={state.bold}
        onClick={() => chain().toggleBold().run()}
      />
      <ToolbarButton
        icon={Italic}
        label="Курсив"
        shortcut="Mod+I"
        active={state.italic}
        onClick={() => chain().toggleItalic().run()}
      />
      <ToolbarButton
        icon={Underline}
        label="Подчёркнутый"
        shortcut="Mod+U"
        active={state.underline}
        onClick={() => chain().toggleUnderline().run()}
      />
      <ToolbarButton
        icon={Strikethrough}
        label="Зачёркнутый"
        shortcut="Mod+Shift+S"
        active={state.strike}
        onClick={() => chain().toggleStrike().run()}
      />
      <ToolbarButton
        icon={Link2}
        label="Ссылка"
        shortcut="Mod+K"
        active={state.link}
        onClick={onLink}
      />
      <ToolbarButton
        icon={RemoveFormatting}
        label="Очистить оформление"
        onClick={() => chain().unsetAllMarks().run()}
      />
    </div>
  );
}

/**
 * Редактор короткого текста с оформлением для блоков главной:
 * только абзацы, выделения и ссылки — без заголовков, списков и картинок.
 */
export function InlineRichTextEditor({
  id,
  label,
  value,
  onChange,
  rows = 3,
  invalid,
}: {
  id: string;
  label: string;
  value: RichDoc;
  onChange: (value: RichDoc) => void;
  rows?: number;
  invalid?: boolean;
}) {
  // Редактору нужен хотя бы один абзац
  const content = value.content.length ? value : EMPTY_DOC;
  const [linkOpen, setLinkOpen] = useState(false);
  const openLink = useRef(() => setLinkOpen(true));

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        listKeymap: false,
        blockquote: false,
        code: false,
        codeBlock: false,
        horizontalRule: false,
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: "https",
          HTMLAttributes: { rel: null, target: null },
        },
      }),
      Placeholder.configure({ placeholder: "Текст…" }),
      LinkShortcut.configure({ onLink: () => openLink.current() }),
    ],
    [],
  );

  const editor = useEditor({
    extensions,
    content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        id,
        "aria-label": label,
        class:
          "tiptap-mini px-3.5 py-2.5 text-[0.95rem] leading-relaxed outline-none",
        style: `min-height: ${Math.max(rows, 2) * 1.65 + 1.25}rem`,
      },
      transformPastedHTML: cleanPastedHtml,
    },
    onUpdate: ({ editor }) => onChange(toPlainJSON(editor) as RichDoc),
  });

  // Значение заменили снаружи (например, сброс формы)
  useEffect(() => {
    if (!editor) return;
    if (JSON.stringify(toPlainJSON(editor)) !== JSON.stringify(content)) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [editor, content]);

  return (
    <div
      className={cn(
        "rounded-[0.9rem] border bg-background transition focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20",
        invalid ? "border-red-400" : "border-border",
      )}
    >
      {editor ? (
        <>
          <InlineToolbar editor={editor} onLink={() => setLinkOpen(true)} />
          <LinkDialog
            editor={editor}
            open={linkOpen}
            onClose={() => setLinkOpen(false)}
          />
        </>
      ) : (
        <div className="h-[45px] rounded-t-[0.9rem] border-b border-border bg-card" />
      )}
      <EditorContent editor={editor} />
    </div>
  );
}
