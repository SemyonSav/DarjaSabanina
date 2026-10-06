"use client";

import { useEditorState, type Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  RemoveFormatting,
  Strikethrough,
  Underline,
  Undo2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { HEADING_LEVELS } from "@/lib/content/extensions";

const isMac =
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad/.test(navigator.platform);
const mod = isMac ? "⌘" : "Ctrl";

export function ToolbarButton({
  icon: Icon,
  label,
  shortcut,
  active,
  disabled,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  shortcut?: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  const title = shortcut ? `${label} (${shortcut.replace("Mod", mod)})` : label;
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      disabled={disabled}
      // Не уводим фокус из редактора, иначе пропадёт выделение
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-[0.6rem] transition disabled:opacity-35",
        active
          ? "bg-accent-soft text-accent"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <Icon className="size-[1.05rem]" />
    </button>
  );
}

export function ToolbarDivider() {
  return <span aria-hidden className="mx-1 h-6 w-px bg-border" />;
}

type BlockType = "paragraph" | `h${(typeof HEADING_LEVELS)[number]}`;

const blockLabels: Record<BlockType, string> = {
  paragraph: "Обычный текст",
  h2: "Заголовок H2",
  h3: "Заголовок H3",
  h4: "Заголовок H4",
};

function useToolbarState(editor: Editor) {
  return useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      block: (HEADING_LEVELS.map((level) => `h${level}` as BlockType).find(
        (type) => e.isActive("heading", { level: Number(type.slice(1)) }),
      ) ?? "paragraph") as BlockType,
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      strike: e.isActive("strike"),
      bulletList: e.isActive("bulletList"),
      orderedList: e.isActive("orderedList"),
      blockquote: e.isActive("blockquote"),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });
}

/** Основная панель инструментов редактора */
export function Toolbar({
  editor,
  children,
}: {
  editor: Editor;
  /** Дополнительные кнопки (ссылка, картинка) */
  children?: React.ReactNode;
}) {
  const state = useToolbarState(editor);
  const chain = () => editor.chain().focus();

  function setBlock(type: BlockType) {
    if (type === "paragraph") chain().setParagraph().run();
    else
      chain()
        .setHeading({ level: Number(type.slice(1)) as 2 | 3 | 4 })
        .run();
  }

  return (
    <div
      role="toolbar"
      aria-label="Форматирование текста"
      className="sticky top-[61px] z-10 flex flex-wrap lg:top-0 items-center gap-0.5 rounded-t-[0.9rem] border-b border-border bg-card/95 px-2 py-1.5 backdrop-blur"
    >
      <ToolbarButton
        icon={Undo2}
        label="Отменить"
        shortcut="Mod+Z"
        disabled={!state.canUndo}
        onClick={() => chain().undo().run()}
      />
      <ToolbarButton
        icon={Redo2}
        label="Повторить"
        shortcut="Mod+Shift+Z"
        disabled={!state.canRedo}
        onClick={() => chain().redo().run()}
      />
      <ToolbarDivider />
      <select
        aria-label="Тип блока"
        value={state.block}
        onChange={(e) => setBlock(e.target.value as BlockType)}
        className="h-9 rounded-[0.6rem] border border-border bg-background px-2 text-sm outline-none focus:border-accent"
      >
        {(Object.keys(blockLabels) as BlockType[]).map((type) => (
          <option key={type} value={type}>
            {blockLabels[type]}
          </option>
        ))}
      </select>
      <ToolbarDivider />
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
      <ToolbarDivider />
      <ToolbarButton
        icon={List}
        label="Маркированный список"
        shortcut="Mod+Shift+8"
        active={state.bulletList}
        onClick={() => chain().toggleBulletList().run()}
      />
      <ToolbarButton
        icon={ListOrdered}
        label="Нумерованный список"
        shortcut="Mod+Shift+7"
        active={state.orderedList}
        onClick={() => chain().toggleOrderedList().run()}
      />
      <ToolbarButton
        icon={Quote}
        label="Цитата"
        shortcut="Mod+Shift+B"
        active={state.blockquote}
        onClick={() => chain().toggleBlockquote().run()}
      />
      <ToolbarButton
        icon={Minus}
        label="Разделитель"
        onClick={() => chain().setHorizontalRule().run()}
      />
      {children ? (
        <>
          <ToolbarDivider />
          {children}
        </>
      ) : null}
      <ToolbarDivider />
      <ToolbarButton
        icon={RemoveFormatting}
        label="Очистить форматирование"
        onClick={() => chain().unsetAllMarks().clearNodes().run()}
      />
    </div>
  );
}
