"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Editor } from "@tiptap/react";
import { FileText, Link2Off } from "lucide-react";
import {
  buildLinkAttrs,
  isInternalHref,
  isSafeHref,
  normalizeHref,
} from "@/lib/content/links";
import { Field, inputClass } from "@/components/admin/ui";
import { searchArticlesForLink } from "@/app/admin/(panel)/articles/actions";

interface ArticleOption {
  title: string;
  slug: string;
}

function currentLink(editor: Editor) {
  const attrs = editor.getAttributes("link") as {
    href?: string;
    target?: string | null;
    rel?: string | null;
  };
  return {
    href: attrs.href ?? "",
    newTab: attrs.target === "_blank",
    nofollow: Boolean(attrs.rel?.includes("nofollow")),
  };
}

/** Диалог вставки и правки ссылки */
export function LinkDialog({
  editor,
  open,
  onClose,
}: {
  editor: Editor;
  open: boolean;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [href, setHref] = useState("");
  const [text, setText] = useState("");
  const [newTab, setNewTab] = useState(false);
  const [nofollow, setNofollow] = useState(false);
  const [error, setError] = useState("");
  const [hasSelection, setHasSelection] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [articles, setArticles] = useState<ArticleOption[]>([]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!open) {
      if (dialog.open) dialog.close();
      return;
    }
    // Выделяем ссылку целиком, если курсор стоит внутри неё
    if (editor.isActive("link")) {
      editor.chain().extendMarkRange("link").run();
    }
    const link = currentLink(editor);
    const { from, to, empty } = editor.state.selection;
    setHref(link.href);
    setNewTab(link.newTab);
    setNofollow(link.nofollow);
    setIsEditing(Boolean(link.href));
    setHasSelection(!empty);
    setText(empty ? "" : editor.state.doc.textBetween(from, to, " "));
    setError("");
    dialog.showModal();
  }, [open, editor]);

  // Поиск своих статей для внутренней ссылки
  useEffect(() => {
    if (!open) return;
    const query = href.trim();
    if (/^(https?:|mailto:|tel:)/i.test(query)) {
      setArticles([]);
      return;
    }
    const timer = window.setTimeout(async () => {
      setArticles(
        await searchArticlesForLink(query.replace(/^\/articles\//, "")),
      );
    }, 200);
    return () => window.clearTimeout(timer);
  }, [href, open]);

  function apply(event: React.FormEvent) {
    event.preventDefault();
    // Диалог внутри формы статьи: React-событие submit всплыло бы до неё
    event.stopPropagation();
    const url = normalizeHref(href);
    if (!url) {
      setError("Укажите адрес");
      return;
    }
    if (!isSafeHref(url)) {
      setError("Адрес должен начинаться с https://, mailto:, tel: или /");
      return;
    }
    const attrs = buildLinkAttrs(url, { newTab, nofollow });
    const chain = editor.chain().focus();
    if (hasSelection) {
      chain.extendMarkRange("link").setLink(attrs).run();
    } else {
      const label = text.trim() || url;
      chain
        .insertContent({
          type: "text",
          text: label,
          marks: [{ type: "link", attrs }],
        })
        .unsetMark("link")
        .insertContent(" ")
        .run();
    }
    onClose();
  }

  function removeLink() {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    onClose();
  }

  function pickArticle(article: ArticleOption) {
    setHref(`/articles/${article.slug}`);
    setNewTab(false);
    setNofollow(false);
    if (!hasSelection && !text) setText(article.title);
  }

  const external = href.trim() !== "" && !isInternalHref(normalizeHref(href));

  // Портал: форма диалога не должна оказаться внутри формы статьи
  if (typeof document === "undefined") return null;
  return createPortal(
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="link-dialog-title"
      className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-[1.25rem] border border-border bg-card p-0 text-foreground shadow-soft backdrop:bg-black/30"
    >
      <form onSubmit={apply} className="space-y-4 p-5 md:p-6">
        <h2
          id="link-dialog-title"
          className="font-display text-2xl font-medium"
        >
          {isEditing ? "Изменить ссылку" : "Вставить ссылку"}
        </h2>

        <Field
          label="Адрес или поиск по статьям"
          htmlFor="link-href"
          error={error}
          hint="Внешний адрес (https://…) или начните вводить название своей статьи."
        >
          <input
            id="link-href"
            autoFocus
            value={href}
            onChange={(e) => {
              setHref(e.target.value);
              setError("");
            }}
            placeholder="https://example.com или «тревога»"
            className={inputClass}
          />
        </Field>

        {articles.length ? (
          <ul className="max-h-48 overflow-y-auto rounded-[0.9rem] border border-border">
            {articles.map((article) => (
              <li key={article.slug}>
                <button
                  type="button"
                  onClick={() => pickArticle(article)}
                  className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm transition hover:bg-muted"
                >
                  <FileText className="mt-0.5 size-4 shrink-0 text-accent" />
                  <span>
                    {article.title}
                    <span className="block text-xs text-muted-foreground">
                      /articles/{article.slug}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        {!hasSelection ? (
          <Field label="Текст ссылки" htmlFor="link-text">
            <input
              id="link-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="По умолчанию — сам адрес"
              className={inputClass}
            />
          </Field>
        ) : null}

        <div className="space-y-2 text-sm">
          <label className="flex items-center gap-2.5">
            <input
              type="checkbox"
              checked={newTab}
              onChange={(e) => setNewTab(e.target.checked)}
              className="size-4 accent-[var(--accent)]"
            />
            Открывать в новой вкладке
          </label>
          <label className="flex items-start gap-2.5">
            <input
              type="checkbox"
              checked={nofollow}
              onChange={(e) => setNofollow(e.target.checked)}
              className="mt-0.5 size-4 accent-[var(--accent)]"
            />
            <span>
              Не передавать вес ссылки (nofollow)
              {external ? (
                <span className="block text-xs text-muted-foreground">
                  Для рекламных и непроверенных сайтов. На авторитетные
                  источники ставить не нужно.
                </span>
              ) : null}
            </span>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2">
          {isEditing ? (
            <button
              type="button"
              onClick={removeLink}
              className="mr-auto inline-flex items-center gap-1.5 text-sm text-red-700 hover:underline dark:text-red-400"
            >
              <Link2Off className="size-4" />
              Убрать ссылку
            </button>
          ) : (
            <span className="mr-auto" />
          )}
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-[0.8rem] border border-border px-4 text-sm transition hover:border-accent hover:text-accent"
          >
            Отмена
          </button>
          <button
            type="submit"
            className="h-10 rounded-[0.8rem] bg-accent px-4 text-sm font-medium text-accent-foreground transition hover:brightness-105"
          >
            {isEditing ? "Сохранить" : "Вставить"}
          </button>
        </div>
      </form>
    </dialog>,
    document.body,
  );
}
