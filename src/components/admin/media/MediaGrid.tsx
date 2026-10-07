"use client";

/* eslint-disable @next/next/no-img-element -- превью в админке */
import { useRef, useState } from "react";
import { Check, Loader2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MediaItem } from "@/app/admin/(panel)/media/actions";
import { ACCEPT_IMAGES, imageFilesFrom, uploadImage } from "./uploadImage";

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} КБ`;
  return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
}

/** Кнопка и зона загрузки нескольких файлов */
export function UploadButton({
  onUploaded,
  className,
}: {
  onUploaded: () => void;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  async function uploadAll(files: File[]) {
    setErrors([]);
    const failed: string[] = [];
    for (const [index, file] of files.entries()) {
      setProgress(`Загрузка ${index + 1} из ${files.length}…`);
      try {
        await uploadImage(file);
      } catch (e) {
        failed.push(
          `${file.name}: ${e instanceof Error ? e.message : "ошибка"}`,
        );
      }
    }
    setProgress(null);
    setErrors(failed);
    onUploaded();
  }

  return (
    <div className={className}>
      <button
        type="button"
        disabled={Boolean(progress)}
        onClick={() => inputRef.current?.click()}
        className="inline-flex h-11 items-center gap-2 rounded-[0.9rem] bg-accent px-5 text-[0.95rem] font-medium text-accent-foreground transition hover:brightness-105 disabled:opacity-60"
      >
        {progress ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Upload className="size-4" />
        )}
        {progress ?? "Загрузить изображения"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_IMAGES}
        multiple
        hidden
        onChange={(e) => {
          const files = imageFilesFrom(e.target.files);
          e.target.value = "";
          if (files.length) void uploadAll(files);
        }}
      />
      {errors.length ? (
        <ul
          role="alert"
          className="mt-2 space-y-1 text-sm text-red-700 dark:text-red-400"
        >
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/** Сетка картинок: в медиатеке — для управления, в диалоге — для выбора */
export function MediaGrid({
  items,
  selectedId,
  onSelect,
  renderActions,
}: {
  items: MediaItem[];
  selectedId?: number | null;
  onSelect?: (item: MediaItem) => void;
  renderActions?: (item: MediaItem) => React.ReactNode;
}) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => {
        const selected = item.id === selectedId;
        return (
          <li
            key={item.id}
            className={cn(
              "overflow-hidden rounded-[1rem] border bg-card shadow-soft",
              selected
                ? "border-accent ring-2 ring-accent/30"
                : "border-border",
            )}
          >
            <button
              type="button"
              disabled={!onSelect}
              onClick={() => onSelect?.(item)}
              className="relative block w-full bg-sand disabled:cursor-default"
              aria-label={
                onSelect
                  ? `Выбрать: ${item.alt || item.originalName}`
                  : undefined
              }
            >
              <img
                src={item.url}
                alt=""
                loading="lazy"
                className="aspect-[4/3] w-full object-cover"
              />
              {selected ? (
                <span className="absolute right-2 top-2 inline-flex size-7 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <Check className="size-4" />
                </span>
              ) : null}
            </button>
            <div className="space-y-1 p-3 text-xs text-muted-foreground">
              <p
                className={cn(
                  "truncate text-sm",
                  item.alt
                    ? "text-foreground"
                    : "text-amber-700 dark:text-amber-400",
                )}
                title={item.alt}
              >
                {item.alt || "Нет описания (alt)"}
              </p>
              <p>
                {item.width}×{item.height} · {formatBytes(item.size)}
              </p>
              {renderActions?.(item)}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
