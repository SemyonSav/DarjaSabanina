"use client";

/* eslint-disable @next/next/no-img-element -- превью в админке */
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  ExternalLink,
  ImagePlus,
  Plus,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import type { MediaImage } from "@/types";
import { cn } from "@/lib/utils";
import { ICONS, type IconName } from "@/lib/home/schema";
import type { BlockDefinition, FieldDef } from "@/lib/home/fields";
import { richTextFromString, type RichDoc } from "@/lib/home/rich-text";
import { InlineRichTextEditor } from "@/components/admin/editor/InlineRichTextEditor";
import { iconComponents } from "@/components/ui/icons";
import { MediaPicker } from "@/components/admin/media/MediaPicker";
import { cardClass, inputClass, textareaClass } from "@/components/admin/ui";
import {
  resetBlockAction,
  saveBlockAction,
} from "@/app/admin/(panel)/home/actions";

type Value = Record<string, unknown>;
type Path = (string | number)[];
type Errors = Record<string, string>;

function getIn(value: unknown, path: Path): unknown {
  return path.reduce<unknown>(
    (acc, key) => (acc as Record<string | number, unknown> | undefined)?.[key],
    value,
  );
}

function setIn<T>(value: T, path: Path, next: unknown): T {
  if (!path.length) return next as T;
  const [key, ...rest] = path;
  const copy = (Array.isArray(value) ? [...value] : { ...value }) as Record<
    string | number,
    unknown
  >;
  copy[key] = setIn(copy[key], rest, next);
  return copy as T;
}

interface FieldProps {
  field: FieldDef;
  path: Path;
  root: Value;
  errors: Errors;
  media: Record<number, MediaImage>;
  onChange: (path: Path, value: unknown) => void;
  onMedia: (image: MediaImage) => void;
}

function FieldShell({
  field,
  path,
  errors,
  children,
}: Pick<FieldProps, "field" | "path" | "errors"> & {
  children: React.ReactNode;
}) {
  const error = errors[path.join(".")];
  return (
    <div className="space-y-1.5">
      <label htmlFor={path.join("-")} className="block text-sm font-medium">
        {field.label}
      </label>
      {children}
      {error ? (
        <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
      ) : field.hint ? (
        <p className="text-xs text-muted-foreground">{field.hint}</p>
      ) : null}
    </div>
  );
}

function IconPicker({
  value,
  onChange,
}: {
  value: IconName;
  onChange: (icon: IconName) => void;
}) {
  return (
    <div role="radiogroup" className="flex flex-wrap gap-1.5">
      {ICONS.map((name) => {
        const Icon = iconComponents[name];
        const selected = name === value;
        return (
          <button
            key={name}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={name}
            title={name}
            onClick={() => onChange(name)}
            className={cn(
              "inline-flex size-10 items-center justify-center rounded-[0.7rem] border transition",
              selected
                ? "border-accent bg-accent-soft text-accent"
                : "border-border text-muted-foreground hover:border-accent/50 hover:text-foreground",
            )}
          >
            <Icon className="size-[1.1rem]" />
          </button>
        );
      })}
    </div>
  );
}

function ImageInput({
  value,
  image,
  onChange,
  onMedia,
}: {
  value: number | null;
  image: MediaImage | undefined;
  onChange: (id: number | null) => void;
  onMedia: (image: MediaImage) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {value && image ? (
        <div className="relative w-full max-w-xs overflow-hidden rounded-[0.9rem] border border-border bg-sand">
          <img
            src={image.url}
            alt=""
            className="max-h-56 w-full object-contain"
          />
          <div className="absolute right-2 top-2 flex gap-1.5">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="h-8 rounded-full bg-card/90 px-3 text-xs font-medium shadow-soft hover:text-accent"
            >
              Заменить
            </button>
            <button
              type="button"
              aria-label="Убрать картинку"
              onClick={() => onChange(null)}
              className="inline-flex size-8 items-center justify-center rounded-full bg-card/90 shadow-soft hover:text-accent"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-24 w-full max-w-xs flex-col items-center justify-center gap-1.5 rounded-[0.9rem] border border-dashed border-border text-sm text-muted-foreground transition hover:border-accent hover:text-accent"
        >
          <ImagePlus className="size-5" />
          Выбрать или загрузить
        </button>
      )}
      <MediaPicker
        open={open}
        selectedId={value}
        onSelect={(picked) => {
          onMedia(picked);
          onChange(picked.id);
        }}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

function ListField(
  props: FieldProps & { field: Extract<FieldDef, { type: "list" }> },
) {
  const { field, path, root, onChange } = props;
  const items = (getIn(root, path) as Value[] | undefined) ?? [];
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function update(next: Value[]) {
    onChange(path, next);
  }

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    update(next);
    setOpenIndex((current) => (current === index ? target : current));
  }

  const listError = props.errors[path.join(".")];
  const canAdd = !field.max || items.length < field.max;

  return (
    <fieldset className="space-y-3">
      <legend className="mb-1 text-sm font-medium">
        {field.label}{" "}
        <span className="font-normal text-muted-foreground">
          ({items.length})
        </span>
      </legend>
      {listError ? (
        <p className="text-sm text-red-700 dark:text-red-400">{listError}</p>
      ) : null}
      {items.map((item, index) => {
        const itemPath = [...path, index];
        const hasError = Object.keys(props.errors).some((key) =>
          key.startsWith(`${itemPath.join(".")}.`),
        );
        const title = String(item[field.titleField] ?? "").trim();
        const open = openIndex === index || hasError;
        return (
          <div
            key={index}
            className={cn(
              "rounded-[1rem] border bg-background",
              hasError ? "border-red-400" : "border-border",
            )}
          >
            <div className="flex items-center gap-2 px-3 py-2">
              <button
                type="button"
                onClick={() => setOpenIndex(open ? null : index)}
                aria-expanded={open}
                className="min-w-0 flex-1 truncate py-1 text-left text-sm"
              >
                <span className="text-muted-foreground">
                  {field.itemLabel} {index + 1}
                </span>
                {title ? <span className="font-medium"> — {title}</span> : null}
              </button>
              <button
                type="button"
                aria-label="Выше"
                disabled={index === 0}
                onClick={() => move(index, -1)}
                className="inline-flex size-8 items-center justify-center rounded-[0.6rem] text-muted-foreground hover:bg-muted disabled:opacity-30"
              >
                <ArrowUp className="size-4" />
              </button>
              <button
                type="button"
                aria-label="Ниже"
                disabled={index === items.length - 1}
                onClick={() => move(index, 1)}
                className="inline-flex size-8 items-center justify-center rounded-[0.6rem] text-muted-foreground hover:bg-muted disabled:opacity-30"
              >
                <ArrowDown className="size-4" />
              </button>
              <button
                type="button"
                aria-label={`Удалить: ${field.itemLabel} ${index + 1}`}
                onClick={() => {
                  if (
                    window.confirm(
                      `Удалить «${title || `${field.itemLabel} ${index + 1}`}»?`,
                    )
                  ) {
                    update(items.filter((_, i) => i !== index));
                    setOpenIndex(null);
                  }
                }}
                className="inline-flex size-8 items-center justify-center rounded-[0.6rem] text-red-700 hover:bg-muted dark:text-red-400"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
            {open ? (
              <div className="space-y-4 border-t border-border px-4 py-4">
                {field.fields.map((child) => (
                  <FieldInput
                    key={child.name}
                    {...props}
                    field={child}
                    path={[...itemPath, child.name]}
                  />
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
      {canAdd ? (
        <button
          type="button"
          onClick={() => {
            update([...items, { ...field.newItem }]);
            setOpenIndex(items.length);
          }}
          className="inline-flex h-10 items-center gap-2 rounded-[0.8rem] border border-dashed border-border px-4 text-sm transition hover:border-accent hover:text-accent"
        >
          <Plus className="size-4" />
          Добавить: {field.itemLabel.toLowerCase()}
        </button>
      ) : null}
    </fieldset>
  );
}

function FieldInput(props: FieldProps) {
  const { field, path, root, onChange } = props;
  const id = path.join("-");
  const value = getIn(root, path);
  const invalid = Boolean(props.errors[path.join(".")]);
  const border = invalid ? "border-red-400" : "";

  switch (field.type) {
    case "text":
    case "link":
      return (
        <FieldShell {...props}>
          <input
            id={id}
            value={String(value ?? "")}
            placeholder={field.placeholder}
            onChange={(e) => onChange(path, e.target.value)}
            className={cn(inputClass, border)}
          />
        </FieldShell>
      );
    case "textarea":
      return (
        <FieldShell {...props}>
          <textarea
            id={id}
            rows={field.rows ?? 3}
            value={String(value ?? "")}
            onChange={(e) => onChange(path, e.target.value)}
            className={cn(textareaClass, border)}
          />
        </FieldShell>
      );
    case "richtext":
      return (
        <FieldShell {...props}>
          <InlineRichTextEditor
            id={id}
            label={field.label}
            rows={field.rows}
            invalid={invalid}
            value={
              typeof value === "string"
                ? richTextFromString(value)
                : ((value as RichDoc | undefined) ?? richTextFromString(""))
            }
            onChange={(doc) => onChange(path, doc)}
          />
        </FieldShell>
      );
    case "icon":
      return (
        <FieldShell {...props}>
          <IconPicker
            value={value as IconName}
            onChange={(icon) => onChange(path, icon)}
          />
        </FieldShell>
      );
    case "image": {
      const mediaId = (value as number | null) ?? null;
      return (
        <FieldShell {...props}>
          <ImageInput
            value={mediaId}
            image={mediaId ? props.media[mediaId] : undefined}
            onChange={(next) => onChange(path, next)}
            onMedia={props.onMedia}
          />
        </FieldShell>
      );
    }
    case "group":
      return (
        <fieldset className="space-y-4 rounded-[1rem] border border-border p-4">
          <legend className="px-1 text-sm font-medium">{field.label}</legend>
          {field.fields.map((child) => (
            <FieldInput
              key={child.name}
              {...props}
              field={child}
              path={[...path, child.name]}
            />
          ))}
        </fieldset>
      );
    case "list":
      return <ListField {...props} field={field} />;
  }
}

/** Форма любого блока по его описанию полей */
export function BlockForm({
  blockKey,
  definition,
  initial,
  media: initialMedia,
  customized,
  previewHref,
}: {
  blockKey: string;
  definition: BlockDefinition;
  initial: Value;
  media: Record<number, MediaImage>;
  customized: boolean;
  previewHref: string;
}) {
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState(() => JSON.stringify(initial));
  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(
    null,
  );
  const [media, setMedia] = useState(initialMedia);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const dirty = JSON.stringify(value) !== saved;

  useEffect(() => {
    function onBeforeUnload(event: BeforeUnloadEvent) {
      if (dirty) event.preventDefault();
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  function onChange(path: Path, next: unknown) {
    setValue((prev) => setIn(prev, path, next));
    setMessage(null);
    const key = path.join(".");
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const result = await saveBlockAction(blockKey, value);
      if (!result.ok) {
        setErrors(result.errors ?? {});
        setMessage({ ok: false, text: result.message });
        return;
      }
      setErrors({});
      setSaved(JSON.stringify(value));
      setMessage({ ok: true, text: "Сохранено — изменения уже на сайте" });
      router.refresh();
    });
  }

  function reset() {
    if (
      !window.confirm(
        "Вернуть исходное содержимое блока? Ваши изменения в нём будут потеряны.",
      )
    ) {
      return;
    }
    startTransition(async () => {
      await resetBlockAction(blockKey);
      // Перезагружаем страницу, чтобы форма получила исходные значения
      window.location.reload();
    });
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]"
    >
      <section className={`${cardClass} min-w-0 space-y-5`}>
        {definition.fields.map((field) => (
          <FieldInput
            key={field.name}
            field={field}
            path={[field.name]}
            root={value}
            errors={errors}
            media={media}
            onChange={onChange}
            onMedia={(image) =>
              setMedia((prev) => ({ ...prev, [image.id]: image }))
            }
          />
        ))}
      </section>

      <aside className={`${cardClass} space-y-3 xl:sticky xl:top-6`}>
        <button
          type="submit"
          disabled={pending || !dirty}
          className="h-11 w-full rounded-[0.9rem] bg-accent font-medium text-accent-foreground transition hover:brightness-105 disabled:opacity-50"
        >
          {pending ? "Сохраняем…" : "Сохранить"}
        </button>
        <p className="text-xs text-muted-foreground">
          {dirty ? "Есть несохранённые изменения" : "Все изменения сохранены"}
        </p>
        {message ? (
          <p
            role="status"
            className={
              message.ok
                ? "text-sm text-accent"
                : "text-sm text-red-700 dark:text-red-400"
            }
          >
            {message.text}
          </p>
        ) : null}
        <div className="space-y-2 border-t border-border pt-3 text-sm">
          <a
            href={previewHref}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-1.5 text-accent hover:underline"
          >
            <ExternalLink className="size-4" />
            Открыть на сайте
          </a>
          {customized ? (
            <button
              type="button"
              disabled={pending}
              onClick={reset}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              <RotateCcw className="size-4" />
              Сбросить к исходному
            </button>
          ) : null}
        </div>
      </aside>
    </form>
  );
}
