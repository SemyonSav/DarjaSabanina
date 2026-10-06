"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2 } from "lucide-react";
import type { MediaImage } from "@/types";
import {
  listMediaAction,
  type MediaItem,
} from "@/app/admin/(panel)/media/actions";
import { EmptyState } from "@/components/admin/ui";
import { MediaGrid, UploadButton } from "./MediaGrid";

/** Выбор изображения из медиатеки (с возможностью загрузить новое) */
export function MediaPicker({
  open,
  selectedId,
  onSelect,
  onClose,
}: {
  open: boolean;
  selectedId?: number | null;
  onSelect: (image: MediaImage) => void;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [items, setItems] = useState<MediaItem[] | null>(null);

  const load = useCallback(async () => {
    setItems(await listMediaAction());
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      void load();
      dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open, load]);

  if (typeof document === "undefined") return null;
  return createPortal(
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="media-picker-title"
      className="m-auto max-h-[85vh] w-[min(56rem,calc(100vw-2rem))] rounded-[1.25rem] border border-border bg-card p-0 text-foreground shadow-soft backdrop:bg-black/30"
    >
      <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card px-5 py-4">
        <h2 id="media-picker-title" className="font-display text-2xl font-medium">
          Медиатека
        </h2>
        <div className="flex items-center gap-2">
          <UploadButton onUploaded={load} />
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-[0.9rem] border border-border px-4 text-sm transition hover:border-accent hover:text-accent"
          >
            Закрыть
          </button>
        </div>
      </div>
      <div className="p-5">
        {items === null ? (
          <div className="flex justify-center py-16 text-muted-foreground">
            <Loader2 className="size-6 animate-spin" />
          </div>
        ) : items.length ? (
          <MediaGrid
            items={items}
            selectedId={selectedId}
            onSelect={(item) => {
              onSelect({
                id: item.id,
                url: item.url,
                alt: item.alt,
                width: item.width,
                height: item.height,
              });
              onClose();
            }}
          />
        ) : (
          <EmptyState>Изображений пока нет — загрузите первое.</EmptyState>
        )}
      </div>
    </dialog>,
    document.body,
  );
}
