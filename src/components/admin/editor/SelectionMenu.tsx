"use client";

import { useEditorState, type Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { Bold, Italic, Strikethrough, Underline } from "lucide-react";
import { ToolbarButton } from "./Toolbar";

/** Плавающее меню над выделенным текстом */
export function SelectionMenu({
  editor,
  children,
}: {
  editor: Editor;
  /** Дополнительные кнопки (например, ссылка) */
  children?: React.ReactNode;
}) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      strike: e.isActive("strike"),
    }),
  });
  const chain = () => editor.chain().focus();

  return (
    <BubbleMenu
      editor={editor}
      options={{ placement: "top", offset: 8 }}
      shouldShow={({ editor: e, state: s }) =>
        !s.selection.empty && e.isEditable && !e.isActive("image")
      }
      className="flex items-center gap-0.5 rounded-[0.8rem] border border-border bg-card p-1 shadow-soft"
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
      {children}
    </BubbleMenu>
  );
}
