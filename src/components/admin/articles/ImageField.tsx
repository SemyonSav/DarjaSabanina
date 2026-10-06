"use client";

/* eslint-disable @next/next/no-img-element -- превью в админке */
import { useEffect, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import type { MediaImage } from "@/types";
import { cn } from "@/lib/utils";
import { MediaPicker } from "@/components/admin/media/MediaPicker";
import { updateMediaAltAction } from "@/app/admin/(panel)/media/actions";

/** Картинка из медиатеки (обложка, OG) с описанием alt */
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
  const [pickerOpen, setPickerOpen] = useState(false);
  const [alt, setAlt] = useState(image?.alt ?? "");

  useEffect(() => setAlt(image?.alt ?? ""), [image]);

  async function saveAlt() {
    if (!image || alt.trim() === image.alt) return;
    await updateMediaAltAction(image.id, alt);
    onChange({ ...image, alt: alt.trim() });
  }

  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium">{label}</p>
      {image ? (
        <div className="overflow-hidden rounded-[0.9rem] border border-border bg-card">
          <div className="relative bg-sand">
            <img
              src={image.url}
              alt=""
              className="aspect-[16/10] w-full object-cover"
            />
            <div className="absolute right-2 top-2 flex gap-1.5">
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="h-8 rounded-full bg-card/90 px-3 text-xs font-medium shadow-soft transition hover:text-accent"
              >
                Заменить
              </button>
              <button
                type="button"
                aria-label="Убрать картинку"
                onClick={() => onChange(null)}
                className="inline-flex size-8 items-center justify-center rounded-full bg-card/90 shadow-soft transition hover:text-accent"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
          <label className="block border-t border-border px-3 py-2">
            <span className="text-xs text-muted-foreground">
              Описание (alt)
            </span>
            <input
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              onBlur={saveAlt}
              onKeyDown={(e) => {
                // Enter не должен отправлять форму статьи
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
              }}
              placeholder="Что изображено на картинке"
              className={cn(
                "mt-1 h-9 w-full rounded-[0.6rem] border bg-background px-2.5 text-sm outline-none focus:border-accent",
                alt.trim() ? "border-border" : "border-amber-400",
              )}
            />
          </label>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="flex aspect-[16/10] w-full flex-col items-center justify-center gap-2 rounded-[0.9rem] border border-dashed border-border text-sm text-muted-foreground transition hover:border-accent hover:text-accent"
        >
          <ImagePlus className="size-5" />
          Выбрать или загрузить
        </button>
      )}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      <MediaPicker
        open={pickerOpen}
        selectedId={image?.id}
        onSelect={onChange}
        onClose={() => setPickerOpen(false)}
      />
    </div>
  );
}
