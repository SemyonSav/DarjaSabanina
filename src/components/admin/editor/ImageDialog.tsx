"use client";

/* eslint-disable @next/next/no-img-element -- превью в админке */
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Editor } from "@tiptap/react";
import { ImagePlus, Loader2 } from "lucide-react";
import type { MediaImage } from "@/types";
import type { FigureImageAttrs } from "@/lib/content/figure-image";
import { Field, inputClass } from "@/components/admin/ui";
import { MediaPicker } from "@/components/admin/media/MediaPicker";
import {
  ACCEPT_IMAGES,
  imageFilesFrom,
  uploadImage,
} from "@/components/admin/media/uploadImage";

export interface ImageDialogRequest {
  /** Файл, брошенный в редактор или вставленный из буфера */
  file?: File;
  /** Позиция вставки (для drag & drop) */
  position?: number;
  /** Правка уже вставленной картинки */
  edit?: boolean;
}

/** Вставка и правка иллюстрации. Без alt вставить нельзя */
export function ImageDialog({
  editor,
  request,
  onClose,
}: {
  editor: Editor;
  request: ImageDialogRequest | null;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<MediaImage | null>(null);
  const [alt, setAlt] = useState("");
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);

  async function upload(file: File) {
    setUploading(true);
    setError("");
    try {
      const media = await uploadImage(file);
      setImage(media);
      if (media.alt) setAlt((current) => current || media.alt);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки");
    } finally {
      setUploading(false);
    }
  }

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!request) {
      if (dialog.open) dialog.close();
      return;
    }
    setError("");
    if (request.edit) {
      const attrs = editor.getAttributes("image") as FigureImageAttrs;
      setImage({
        id: attrs.mediaId ?? 0,
        url: attrs.src,
        alt: attrs.alt,
        width: attrs.width ?? 0,
        height: attrs.height ?? 0,
      });
      setAlt(attrs.alt);
      setCaption(attrs.caption);
    } else {
      setImage(null);
      setAlt("");
      setCaption("");
      if (request.file) void upload(request.file);
    }
    dialog.showModal();
  }, [request, editor]);

  function apply(event: React.FormEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (!image) {
      setError("Загрузите изображение");
      return;
    }
    if (!alt.trim()) {
      setError("Опишите, что на картинке — это alt для поисковиков и незрячих");
      return;
    }
    const attrs: FigureImageAttrs = {
      src: image.url,
      alt: alt.trim(),
      caption: caption.trim(),
      width: image.width || null,
      height: image.height || null,
      mediaId: image.id || null,
    };
    if (request?.edit) {
      editor.chain().focus().updateFigureImage(attrs).run();
    } else {
      editor.chain().focus().insertFigureImage(attrs, request?.position).run();
    }
    onClose();
  }

  if (typeof document === "undefined") return null;
  return createPortal(
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="image-dialog-title"
      className="m-auto w-[min(34rem,calc(100vw-2rem))] rounded-[1.25rem] border border-border bg-card p-0 text-foreground shadow-soft backdrop:bg-black/30"
    >
      <form onSubmit={apply} className="space-y-4 p-5 md:p-6">
        <h2
          id="image-dialog-title"
          className="font-display text-2xl font-medium"
        >
          {request?.edit ? "Изображение" : "Вставить изображение"}
        </h2>

        {image ? (
          <img
            src={image.url}
            alt=""
            className="max-h-64 w-full rounded-[0.9rem] border border-border bg-sand object-contain"
          />
        ) : (
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const [file] = imageFilesFrom(e.dataTransfer.files);
              if (file) void upload(file);
            }}
            className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 rounded-[0.9rem] border border-dashed border-border text-sm text-muted-foreground transition hover:border-accent hover:text-accent"
          >
            {uploading ? (
              <>
                <Loader2 className="size-6 animate-spin" />
                Загрузка и оптимизация…
              </>
            ) : (
              <>
                <ImagePlus className="size-6" />
                Выберите файл или перетащите его сюда
                <span className="text-xs">JPG, PNG, WebP, HEIC — до 15 МБ</span>
              </>
            )}
          </button>
        )}
        {!image ? (
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="text-sm text-accent hover:underline"
          >
            или выбрать из медиатеки
          </button>
        ) : null}
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT_IMAGES}
          hidden
          onChange={(e) => {
            const [file] = imageFilesFrom(e.target.files);
            if (file) void upload(file);
            e.target.value = "";
          }}
        />

        <Field
          label="Описание изображения (alt) *"
          htmlFor="image-alt"
          hint="Что изображено, одной фразой. Например: «Психолог на консультации с клиенткой»."
        >
          <input
            id="image-alt"
            value={alt}
            onChange={(e) => {
              setAlt(e.target.value);
              setError("");
            }}
            className={inputClass}
          />
        </Field>

        <Field
          label="Подпись под изображением"
          htmlFor="image-caption"
          hint="Необязательно. Видна читателю."
        >
          <input
            id="image-caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className={inputClass}
          />
        </Field>

        {error ? (
          <p role="alert" className="text-sm text-red-700 dark:text-red-400">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
          {image && !request?.edit ? (
            <button
              type="button"
              onClick={() => setImage(null)}
              className="mr-auto text-sm text-muted-foreground hover:text-foreground hover:underline"
            >
              Выбрать другое
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-[0.8rem] border border-border px-4 text-sm transition hover:border-accent hover:text-accent"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={uploading}
            className="h-10 rounded-[0.8rem] bg-accent px-4 text-sm font-medium text-accent-foreground transition hover:brightness-105 disabled:opacity-60"
          >
            {request?.edit ? "Сохранить" : "Вставить"}
          </button>
        </div>
      </form>
      <MediaPicker
        open={pickerOpen}
        onSelect={(media) => {
          setImage(media);
          setAlt((current) => current || media.alt);
          setError("");
        }}
        onClose={() => setPickerOpen(false)}
      />
    </dialog>,
    document.body,
  );
}
