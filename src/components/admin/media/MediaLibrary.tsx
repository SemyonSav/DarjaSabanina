"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import {
  deleteMediaAction,
  updateMediaAltAction,
  type MediaItem,
} from "@/app/admin/(panel)/media/actions";
import { EmptyState, PageHeader } from "@/components/admin/ui";
import { MediaGrid, UploadButton } from "./MediaGrid";

function AltEditor({ item }: { item: MediaItem }) {
  const [alt, setAlt] = useState(item.alt);
  const [savedAlt, setSavedAlt] = useState(item.alt);
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");

  async function save() {
    if (alt.trim() === savedAlt) return;
    setState("saving");
    await updateMediaAltAction(item.id, alt);
    setSavedAlt(alt.trim());
    setState("saved");
  }

  return (
    <label className="block pt-1">
      <span className="sr-only">Описание (alt)</span>
      <input
        value={alt}
        onChange={(e) => {
          setAlt(e.target.value);
          setState("idle");
        }}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        }}
        placeholder="Описание (alt)"
        className="h-8 w-full rounded-[0.6rem] border border-border bg-background px-2 text-xs text-foreground outline-none focus:border-accent"
      />
      <span className="mt-0.5 block h-4 text-[11px]">
        {state === "saving"
          ? "Сохранение…"
          : state === "saved"
            ? "Сохранено"
            : ""}
      </span>
    </label>
  );
}

export function MediaLibrary({ items }: { items: MediaItem[] }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function remove(item: MediaItem) {
    if (!window.confirm("Удалить изображение? Это действие нельзя отменить.")) {
      return;
    }
    startTransition(async () => {
      const result = await deleteMediaAction(item.id);
      setMessage(result.ok ? null : result.message);
      router.refresh();
    });
  }

  return (
    <>
      <PageHeader
        title="Медиатека"
        description="Изображения для статей. Описание (alt) задаётся здесь и подставляется при выборе картинки."
        actions={<UploadButton onUploaded={() => router.refresh()} />}
      />
      {message ? (
        <p
          role="alert"
          className="mb-4 rounded-[0.9rem] border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
        >
          {message}
        </p>
      ) : null}
      {items.length ? (
        <MediaGrid
          items={items}
          renderActions={(item) => (
            <>
              <AltEditor key={item.id} item={item} />
              <div className="flex items-center justify-between gap-2">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener"
                  className="truncate hover:text-accent"
                  title={item.originalName}
                >
                  {item.originalName || "Открыть"}
                </a>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => remove(item)}
                  aria-label="Удалить изображение"
                  className="shrink-0 text-red-700 transition hover:opacity-70 disabled:opacity-40 dark:text-red-400"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </>
          )}
        />
      ) : (
        <EmptyState>Изображений пока нет — загрузите первое.</EmptyState>
      )}
    </>
  );
}
