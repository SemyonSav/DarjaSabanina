"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import type { Category } from "@/types";
import { slugify } from "@/lib/slug";
import { SEO_LIMITS } from "@/lib/validation/article";
import type {
  CategoryFieldErrors,
  CategoryInput,
} from "@/lib/validation/category";
import {
  deleteCategoryAction,
  saveCategory,
} from "@/app/admin/(panel)/categories/actions";
import {
  EmptyState,
  Field,
  PageHeader,
  cardClass,
  inputClass,
  textareaClass,
} from "@/components/admin/ui";
import { CharCounter } from "@/components/admin/articles/SeoFields";

type Editing = { id: number | null; values: CategoryInput };

function toInput(category: Category): CategoryInput {
  const { name, slug, description, seoTitle, seoDescription, sortOrder } =
    category;
  return { name, slug, description, seoTitle, seoDescription, sortOrder };
}

function CategoryForm({
  editing,
  onDone,
}: {
  editing: Editing;
  onDone: () => void;
}) {
  const [values, setValues] = useState(editing.values);
  const [errors, setErrors] = useState<CategoryFieldErrors>({});
  const [message, setMessage] = useState("");
  const [slugTouched, setSlugTouched] = useState(editing.id !== null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function set<K extends keyof CategoryInput>(key: K, value: CategoryInput[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const result = await saveCategory(editing.id, values);
      if (!result.ok) {
        setErrors(result.errors ?? {});
        setMessage(result.message);
        return;
      }
      router.refresh();
      onDone();
    });
  }

  return (
    <form onSubmit={submit} noValidate className={`${cardClass} space-y-4`}>
      <h2 className="font-display text-2xl font-medium">
        {editing.id ? "Редактирование рубрики" : "Новая рубрика"}
      </h2>
      <Field label="Название" htmlFor="cat-name" error={errors.name}>
        <input
          id="cat-name"
          value={values.name}
          onChange={(e) => {
            const name = e.target.value;
            setValues((prev) => ({
              ...prev,
              name,
              slug: slugTouched ? prev.slug : slugify(name),
            }));
          }}
          className={inputClass}
        />
      </Field>
      <Field
        label="Адрес"
        htmlFor="cat-slug"
        error={errors.slug}
        hint={`/articles/category/${values.slug || "…"}${editing.id ? " — при смене старый адрес перенаправит на новый" : ""}`}
      >
        <input
          id="cat-slug"
          value={values.slug}
          onChange={(e) => {
            setSlugTouched(true);
            set("slug", e.target.value.toLowerCase());
          }}
          className={inputClass}
        />
      </Field>
      <Field
        label="Описание"
        htmlFor="cat-description"
        error={errors.description}
        hint="Вводный текст на странице рубрики: 1–3 абзаца о теме с ключевыми словами."
      >
        <textarea
          id="cat-description"
          rows={4}
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
          className={textareaClass}
        />
      </Field>
      <Field
        label="SEO-заголовок"
        htmlFor="cat-seo-title"
        error={errors.seoTitle}
        hint={
          <>
            Если пусто — «Статьи: {values.name || "название"}».{" "}
            <CharCounter value={values.seoTitle} limits={SEO_LIMITS.title} />
          </>
        }
      >
        <input
          id="cat-seo-title"
          value={values.seoTitle}
          onChange={(e) => set("seoTitle", e.target.value)}
          className={inputClass}
        />
      </Field>
      <Field
        label="SEO-описание"
        htmlFor="cat-seo-description"
        error={errors.seoDescription}
        hint={
          <CharCounter
            value={values.seoDescription}
            limits={SEO_LIMITS.description}
          />
        }
      >
        <textarea
          id="cat-seo-description"
          rows={3}
          value={values.seoDescription}
          onChange={(e) => set("seoDescription", e.target.value)}
          className={textareaClass}
        />
      </Field>
      <Field
        label="Порядок"
        htmlFor="cat-order"
        error={errors.sortOrder}
        hint="Меньше — выше в списке рубрик на сайте."
      >
        <input
          id="cat-order"
          type="number"
          min={0}
          value={values.sortOrder}
          onChange={(e) => set("sortOrder", Number(e.target.value) || 0)}
          className={`${inputClass} w-28`}
        />
      </Field>
      {message ? (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          {message}
        </p>
      ) : null}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="h-11 rounded-[0.9rem] bg-accent px-5 font-medium text-accent-foreground transition hover:brightness-105 disabled:opacity-60"
        >
          Сохранить
        </button>
        <button
          type="button"
          onClick={onDone}
          className="h-11 rounded-[0.9rem] border border-border px-5 transition hover:border-accent hover:text-accent"
        >
          Отмена
        </button>
      </div>
    </form>
  );
}

export function CategoryManager({
  categories,
  counts,
}: {
  categories: Category[];
  counts: Record<number, number>;
}) {
  const [editing, setEditing] = useState<Editing | null>(null);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function startNew() {
    setEditing({
      id: null,
      values: {
        name: "",
        slug: "",
        description: "",
        seoTitle: "",
        seoDescription: "",
        sortOrder: categories.length,
      },
    });
  }

  function remove(category: Category) {
    if (!window.confirm(`Удалить рубрику «${category.name}»?`)) return;
    startTransition(async () => {
      const result = await deleteCategoryAction(category.id);
      setMessage(result.ok ? "" : result.message);
      router.refresh();
    });
  }

  return (
    <>
      <PageHeader
        title="Рубрики"
        description="У каждой рубрики своя страница на сайте — её тоже находят поисковики."
        actions={
          <button
            type="button"
            onClick={startNew}
            className="inline-flex h-12 items-center gap-2 rounded-[1.25rem] bg-accent px-6 font-medium text-accent-foreground shadow-soft transition hover:brightness-105"
          >
            <Plus className="size-4" />
            Новая рубрика
          </button>
        }
      />
      {message ? (
        <p
          role="alert"
          className="mb-4 rounded-[0.9rem] border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
        >
          {message}
        </p>
      ) : null}
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_26rem]">
        {categories.length ? (
          <ul className="divide-y divide-border overflow-hidden rounded-[1.25rem] border border-border bg-card shadow-soft">
            {categories.map((category) => (
              <li
                key={category.id}
                className="flex items-center gap-4 px-5 py-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{category.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    /articles/category/{category.slug} · статей:{" "}
                    {counts[category.id] ?? 0}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label={`Редактировать «${category.name}»`}
                  onClick={() =>
                    setEditing({ id: category.id, values: toInput(category) })
                  }
                  className="inline-flex size-9 items-center justify-center rounded-[0.6rem] text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  type="button"
                  disabled={pending}
                  aria-label={`Удалить «${category.name}»`}
                  onClick={() => remove(category)}
                  className="inline-flex size-9 items-center justify-center rounded-[0.6rem] text-red-700 transition hover:bg-muted disabled:opacity-40 dark:text-red-400"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState>Рубрик пока нет.</EmptyState>
        )}
        {editing ? (
          <CategoryForm
            key={editing.id ?? "new"}
            editing={editing}
            onDone={() => setEditing(null)}
          />
        ) : null}
      </div>
    </>
  );
}
