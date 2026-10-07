"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  GripVertical,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TestimonialRow } from "@/lib/db/schema";
import {
  deleteTestimonialAction,
  reorderTestimonialsAction,
  saveTestimonial,
  setTestimonialPublished,
  type TestimonialErrors,
  type TestimonialInput,
} from "@/app/admin/(panel)/testimonials/actions";
import {
  Badge,
  EmptyState,
  Field,
  PageHeader,
  cardClass,
  inputClass,
  textareaClass,
} from "@/components/admin/ui";

type Editing = { id: number | null; values: TestimonialInput };

const iconButton =
  "inline-flex size-9 items-center justify-center rounded-[0.6rem] text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-30";

function TestimonialForm({
  editing,
  onDone,
}: {
  editing: Editing;
  onDone: () => void;
}) {
  const [values, setValues] = useState(editing.values);
  const [errors, setErrors] = useState<TestimonialErrors>({});
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function set<K extends keyof TestimonialInput>(
    key: K,
    value: TestimonialInput[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const result = await saveTestimonial(editing.id, values);
      if (!result.ok) {
        setErrors(result.errors ?? {});
        return;
      }
      router.refresh();
      onDone();
    });
  }

  return (
    <form onSubmit={submit} noValidate className={`${cardClass} space-y-4`}>
      <h2 className="font-display text-2xl font-medium">
        {editing.id ? "Редактирование отзыва" : "Новый отзыв"}
      </h2>
      <Field label="Имя" htmlFor="t-name" error={errors.name}>
        <input
          id="t-name"
          value={values.name}
          onChange={(e) => set("name", e.target.value)}
          className={inputClass}
        />
      </Field>
      <Field
        label="Подпись"
        htmlFor="t-role"
        error={errors.role}
        hint="Например: «запрос: тревога». Необязательно."
      >
        <input
          id="t-role"
          value={values.role}
          onChange={(e) => set("role", e.target.value)}
          className={inputClass}
        />
      </Field>
      <Field label="Текст отзыва" htmlFor="t-text" error={errors.text}>
        <textarea
          id="t-text"
          rows={6}
          value={values.text}
          onChange={(e) => set("text", e.target.value)}
          className={textareaClass}
        />
      </Field>
      <label className="flex items-center gap-2.5 text-sm">
        <input
          type="checkbox"
          checked={values.isPublished}
          onChange={(e) => set("isPublished", e.target.checked)}
          className="size-4 accent-[var(--accent)]"
        />
        Показывать на сайте
      </label>
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

export function TestimonialManager({ items }: { items: TestimonialRow[] }) {
  const [order, setOrder] = useState(items);
  const [editing, setEditing] = useState<Editing | null>(null);
  const [dragId, setDragId] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => setOrder(items), [items]);

  function persistOrder(next: TestimonialRow[]) {
    setOrder(next);
    startTransition(async () => {
      await reorderTestimonialsAction(next.map((t) => t.id));
      router.refresh();
    });
  }

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= order.length) return;
    const next = [...order];
    [next[index], next[target]] = [next[target], next[index]];
    persistOrder(next);
  }

  function dropOn(targetId: number) {
    if (dragId === null || dragId === targetId) return;
    const next = order.filter((t) => t.id !== dragId);
    const dragged = order.find((t) => t.id === dragId)!;
    next.splice(
      next.findIndex((t) => t.id === targetId),
      0,
      dragged,
    );
    setDragId(null);
    persistOrder(next);
  }

  function togglePublished(item: TestimonialRow) {
    startTransition(async () => {
      await setTestimonialPublished(item.id, !item.isPublished);
      router.refresh();
    });
  }

  function remove(item: TestimonialRow) {
    if (!window.confirm(`Удалить отзыв «${item.name}»?`)) return;
    startTransition(async () => {
      await deleteTestimonialAction(item.id);
      router.refresh();
    });
  }

  return (
    <>
      <PageHeader
        title="Отзывы"
        description="Порядок здесь — порядок в слайдере на главной. Перетащите карточку или используйте стрелки."
        actions={
          <button
            type="button"
            onClick={() =>
              setEditing({
                id: null,
                values: { name: "", role: "", text: "", isPublished: true },
              })
            }
            className="inline-flex h-12 items-center gap-2 rounded-[1.25rem] bg-accent px-6 font-medium text-accent-foreground shadow-soft transition hover:brightness-105"
          >
            <Plus className="size-4" />
            Новый отзыв
          </button>
        }
      />
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_26rem]">
        {order.length ? (
          <ul className="space-y-3">
            {order.map((item, index) => (
              <li
                key={item.id}
                draggable
                onDragStart={() => setDragId(item.id)}
                onDragEnd={() => setDragId(null)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => dropOn(item.id)}
                className={cn(
                  "flex gap-3 rounded-[1.25rem] border border-border bg-card p-4 shadow-soft transition",
                  dragId === item.id && "opacity-50",
                  !item.isPublished && "bg-card/60",
                )}
              >
                <GripVertical
                  aria-hidden
                  className="mt-1 size-5 shrink-0 cursor-grab text-muted-foreground"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{item.name}</p>
                    {item.role ? (
                      <span className="text-sm text-muted-foreground">
                        {item.role}
                      </span>
                    ) : null}
                    {!item.isPublished ? <Badge>Скрыт</Badge> : null}
                  </div>
                  <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
                    {item.text}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-0.5 sm:flex-row sm:items-start">
                  <button
                    type="button"
                    aria-label="Выше"
                    disabled={pending || index === 0}
                    onClick={() => move(index, -1)}
                    className={iconButton}
                  >
                    <ArrowUp className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Ниже"
                    disabled={pending || index === order.length - 1}
                    onClick={() => move(index, 1)}
                    className={iconButton}
                  >
                    <ArrowDown className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={
                      item.isPublished ? "Скрыть с сайта" : "Показать на сайте"
                    }
                    disabled={pending}
                    onClick={() => togglePublished(item)}
                    className={iconButton}
                  >
                    {item.isPublished ? (
                      <Eye className="size-4" />
                    ) : (
                      <EyeOff className="size-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    aria-label="Редактировать"
                    onClick={() =>
                      setEditing({
                        id: item.id,
                        values: {
                          name: item.name,
                          role: item.role,
                          text: item.text,
                          isPublished: item.isPublished,
                        },
                      })
                    }
                    className={iconButton}
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Удалить"
                    disabled={pending}
                    onClick={() => remove(item)}
                    className={`${iconButton} text-red-700 dark:text-red-400`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState>
            Отзывов пока нет. Блок отзывов на главной скрыт.
          </EmptyState>
        )}
        {editing ? (
          <TestimonialForm
            key={editing.id ?? "new"}
            editing={editing}
            onDone={() => setEditing(null)}
          />
        ) : null}
      </div>
    </>
  );
}
