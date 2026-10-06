"use client";

/* eslint-disable @next/next/no-img-element -- превью в админке, оптимизация не нужна */
import { X } from "lucide-react";
import type { MediaImage } from "@/types";

/** Выбранная картинка (обложка, OG). Выбор из медиатеки — в задаче 5.2 */
export function ImageField({
  label,
  hint,
  image,
  onChange,
}: {
  label: string;
  hint?: string;
  image: MediaImage | null;
  onChange: (image: MediaImage | null) => void;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium">{label}</p>
      {image ? (
        <div className="relative overflow-hidden rounded-[0.9rem] border border-border bg-sand">
          <img
            src={image.url}
            alt={image.alt}
            className="aspect-[16/10] w-full object-cover"
          />
          <button
            type="button"
            aria-label="Убрать картинку"
            onClick={() => onChange(null)}
            className="absolute right-2 top-2 inline-flex size-8 items-center justify-center rounded-full bg-card/90 shadow-soft transition hover:text-accent"
          >
            <X className="size-4" />
          </button>
          <p className="truncate border-t border-border bg-card px-3 py-2 text-xs text-muted-foreground">
            alt: {image.alt || "не заполнен"}
          </p>
        </div>
      ) : (
        <div className="flex aspect-[16/10] items-center justify-center rounded-[0.9rem] border border-dashed border-border text-sm text-muted-foreground">
          Не выбрана
        </div>
      )}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
