"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { JSONContent } from "@tiptap/core";
import { History, RefreshCw, Trash2 } from "lucide-react";
import type { ArticleStatus, Category, MediaImage } from "@/types";
import { slugify } from "@/lib/slug";
import { formatDate } from "@/lib/utils";
import {
  SEO_LIMITS,
  articleInputSchema,
  collectFieldErrors,
  parseKeywords,
  type ArticleInput,
  type FieldErrors,
} from "@/lib/validation/article";
import {
  Badge,
  Field,
  cardClass,
  inputClass,
  textareaClass,
} from "@/components/admin/ui";
import { CharCounter, SnippetPreview } from "./SeoFields";
import { ImageField } from "./ImageField";
import { ContentField } from "./ContentField";
import { SeoChecklist } from "./SeoChecklist";
import {
  deleteArticleAction,
  discardAutosave,
  saveArticle,
  type SaveIntent,
} from "@/app/admin/(panel)/articles/actions";
import {
  clearLocalDraft,
  readLocalDraft,
  snapshotOf,
  useAutosave,
  type AutosaveStatus,
  type DraftSnapshot,
} from "./useAutosave";

export interface ArticleFormInitial {
  id?: number;
  status: ArticleStatus;
  publishedAt: string | null;
  updatedAt?: string;
  values: ArticleInput;
  cover: MediaImage | null;
  ogImage: MediaImage | null;
  /** Автосохранённые, но не применённые правки */
  autosave?: DraftSnapshot | null;
}

/** Состояние формы: ключевые слова редактируются строкой через запятую */
export type ArticleFormState = Omit<ArticleInput, "keywords"> & {
  keywordsText: string;
};

export function toFormState(values: ArticleInput): ArticleFormState {
  const { keywords, ...rest } = values;
  return { ...rest, keywordsText: keywords.join(", ") };
}

export function toInput(state: ArticleFormState): ArticleInput {
  const { keywordsText, ...rest } = state;
  return { ...rest, keywords: parseKeywords(keywordsText) };
}

const FLASH_KEY = "article-form-flash";

const primaryButton =
  "h-11 w-full rounded-[0.9rem] bg-accent font-medium text-accent-foreground transition hover:brightness-105 disabled:opacity-60";
const secondaryButton =
  "h-11 w-full rounded-[0.9rem] border border-border font-medium transition hover:border-accent hover:text-accent disabled:opacity-60";

function timeOf(iso: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function AutosaveIndicator({
  status,
  isNew,
}: {
  status: AutosaveStatus;
  isNew: boolean;
}) {
  const text = {
    idle: "Все изменения сохранены",
    pending: "Есть несохранённые правки…",
    saving: "Автосохранение…",
    saved: "",
    error: "Не удалось автосохранить — сохраните вручную",
  }[status.kind];
  return (
    <p
      className={
        status.kind === "error"
          ? "text-xs text-red-700 dark:text-red-400"
          : "text-xs text-muted-foreground"
      }
    >
      {status.kind === "saved"
        ? `Черновик правок сохранён ${isNew ? "в браузере " : ""}в ${timeOf(status.at)}. Нажмите «Сохранить», чтобы применить.`
        : text}
    </p>
  );
}

const statusLabels: Record<ArticleStatus, string> = {
  draft: "Черновик",
  published: "Опубликована",
};

export function ArticleForm({
  initial,
  categories,
  siteName,
}: {
  initial: ArticleFormInitial;
  categories: Category[];
  /** Для превью сниппета: «Заголовок · Имя» */
  siteName: string;
}) {
  const [state, setState] = useState<ArticleFormState>(() =>
    toFormState(initial.values),
  );
  const [cover, setCover] = useState(initial.cover);
  const [ogImage, setOgImage] = useState(initial.ogImage);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<{
    tone: "ok" | "error";
    text: string;
  } | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const [baseline, setBaseline] = useState(() => snapshotOf(initial.values));
  const [restoreCandidate, setRestoreCandidate] = useState<{
    draft: DraftSnapshot;
    source: "server" | "local";
  } | null>(() =>
    initial.autosave ? { draft: initial.autosave, source: "server" } : null,
  );

  // Несохранённый черновик новой статьи из прошлого сеанса
  useEffect(() => {
    if (initial.id) return;
    const local = readLocalDraft();
    if (local) setRestoreCandidate({ draft: local, source: "local" });
  }, [initial.id]);

  const input = useMemo(() => toInput(state), [state]);
  const autosave = useAutosave({
    articleId: initial.id,
    draft: { values: input, cover, ogImage },
    baseline,
    // Пока не решено, что делать с найденным черновиком, не перезаписываем его
    enabled: !restoreCandidate,
  });

  function onEditorReady(normalized: JSONContent) {
    const initialSnapshot = snapshotOf(initial.values);
    if (baseline !== initialSnapshot) return;
    const normalizedValues = { ...initial.values, content: normalized };
    const nextBaseline = snapshotOf(normalizedValues);
    setBaseline(nextBaseline);
    autosave.markSaved(nextBaseline);
    setState((prev) =>
      prev.content === initial.values.content
        ? { ...prev, content: normalized }
        : prev,
    );
  }

  function restoreDraft() {
    if (!restoreCandidate) return;
    const { draft } = restoreCandidate;
    setState(toFormState(draft.values));
    setCover(draft.cover);
    setOgImage(draft.ogImage);
    setSlugTouched(true);
    setRestoreCandidate(null);
  }

  function discardDraft() {
    if (!restoreCandidate) return;
    if (restoreCandidate.source === "local") {
      clearLocalDraft();
    } else if (initial.id) {
      void discardAutosave(initial.id);
    }
    setRestoreCandidate(null);
  }

  async function openPreview(event: React.MouseEvent<HTMLAnchorElement>) {
    if (!autosave.dirty) return;
    // Сначала сохраняем правки, чтобы предпросмотр показал актуальный текст
    event.preventDefault();
    const tab = window.open("about:blank", "_blank");
    await autosave.flush();
    if (tab) tab.location.href = event.currentTarget.href;
  }

  // Сообщение, оставленное перед переходом на страницу новой статьи
  useEffect(() => {
    try {
      const flash = sessionStorage.getItem(FLASH_KEY);
      if (flash) {
        sessionStorage.removeItem(FLASH_KEY);
        setMessage({ tone: "ok", text: flash });
      }
    } catch {}
  }, []);
  // Адрес новой статьи следует за заголовком, пока его не правили вручную
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.id));

  function update<K extends keyof ArticleFormState>(
    key: K,
    value: ArticleFormState[K],
  ) {
    setState((prev) => ({ ...prev, [key]: value }));
    setMessage(null);
    if (errors[key as keyof FieldErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  function onTitleChange(title: string) {
    setMessage(null);
    setState((prev) => ({
      ...prev,
      title,
      slug: slugTouched ? prev.slug : slugify(title),
    }));
  }

  function validate(): ArticleInput | null {
    const result = articleInputSchema.safeParse(toInput(state));
    if (result.success) {
      setErrors({});
      return result.data;
    }
    setErrors(collectFieldErrors(result.error));
    return null;
  }

  function submit(intent: SaveIntent) {
    const input = validate();
    if (!input) {
      setMessage({ tone: "error", text: "Проверьте поля формы" });
      return;
    }
    // Сравниваем с формой как есть (zod обрезает пробелы — это не правка)
    const savedJson = snapshotOf(toInput(state));
    startTransition(async () => {
      const result = await saveArticle(initial.id ?? null, input, intent);
      if (!result.ok) {
        setErrors(result.errors ?? {});
        setMessage({ tone: "error", text: result.message });
        return;
      }
      const text =
        intent === "publish"
          ? "Статья опубликована"
          : intent === "unpublish"
            ? "Статья снята с публикации"
            : "Сохранено";
      setErrors({});
      setBaseline(savedJson);
      autosave.markSaved(savedJson);
      setRestoreCandidate(null);
      if (initial.id) {
        setMessage({ tone: "ok", text });
        router.refresh();
      } else {
        clearLocalDraft();
        try {
          sessionStorage.setItem(FLASH_KEY, text);
        } catch {}
        router.replace(`/admin/articles/${result.id}`);
      }
    });
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    submit("save");
  }

  function onDelete() {
    if (!initial.id) return;
    const confirmed = window.confirm(
      `Удалить статью «${initial.values.title}»? Это действие нельзя отменить.`,
    );
    if (!confirmed) return;
    startTransition(async () => {
      const result = await deleteArticleAction(initial.id!);
      if (!result.ok) {
        setMessage({ tone: "error", text: result.message });
        return;
      }
      router.replace("/admin/articles");
    });
  }

  const isPublished = initial.status === "published";

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]"
    >
      <div className="min-w-0 space-y-6">
        {restoreCandidate ? (
          <div
            role="alert"
            className="flex flex-col gap-3 rounded-[1.25rem] border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 sm:flex-row sm:items-center dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
          >
            <History className="size-5 shrink-0" />
            <p className="flex-1">
              {restoreCandidate.source === "local"
                ? "Найден несохранённый черновик новой статьи"
                : "Есть автосохранённые правки, которые не были применены"}{" "}
              от {formatDate(restoreCandidate.draft.savedAt)},{" "}
              {timeOf(restoreCandidate.draft.savedAt)}.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={restoreDraft}
                className="rounded-[0.8rem] bg-amber-800 px-3 py-1.5 font-medium text-white transition hover:bg-amber-900 dark:bg-amber-700"
              >
                Восстановить
              </button>
              <button
                type="button"
                onClick={discardDraft}
                className="rounded-[0.8rem] border border-amber-400 px-3 py-1.5 transition hover:bg-amber-100 dark:border-amber-700 dark:hover:bg-amber-900/40"
              >
                Отбросить
              </button>
            </div>
          </div>
        ) : null}
        <section className={`${cardClass} space-y-5`}>
          <Field label="Заголовок (H1)" htmlFor="title" error={errors.title}>
            <input
              id="title"
              value={state.title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Например: Тревога как сигнал"
              className={`${inputClass} h-12 font-display text-xl`}
            />
          </Field>

          <Field
            label="Адрес статьи"
            htmlFor="slug"
            error={errors.slug}
            hint={
              isPublished
                ? "Статья опубликована: при смене адреса старый автоматически перенаправит на новый (301)."
                : "Латиница, цифры и дефисы. Короткий адрес с ключевым словом лучше для SEO."
            }
          >
            <div className="flex gap-2">
              <span className="hidden h-11 items-center text-sm text-muted-foreground sm:flex">
                /articles/
              </span>
              <input
                id="slug"
                value={state.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  update("slug", e.target.value.toLowerCase());
                }}
                className={inputClass}
              />
              <button
                type="button"
                title="Сгенерировать из заголовка"
                aria-label="Сгенерировать адрес из заголовка"
                onClick={() => update("slug", slugify(state.title))}
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-[0.9rem] border border-border transition hover:border-accent hover:text-accent"
              >
                <RefreshCw className="size-4" />
              </button>
            </div>
          </Field>

          <Field
            label="Анонс"
            htmlFor="excerpt"
            error={errors.excerpt}
            hint={
              <>
                Показывается в карточке статьи и используется как описание, если
                SEO-описание не заполнено.{" "}
                <CharCounter
                  value={state.excerpt}
                  limits={{ max: SEO_LIMITS.excerpt.max }}
                />
              </>
            }
          >
            <textarea
              id="excerpt"
              rows={3}
              value={state.excerpt}
              onChange={(e) => update("excerpt", e.target.value)}
              className={textareaClass}
            />
          </Field>
        </section>

        <section className={cardClass}>
          <ContentField
            value={state.content}
            onChange={(content: JSONContent) => update("content", content)}
            onReady={onEditorReady}
            error={errors.content}
          />
        </section>

        <section className={`${cardClass} space-y-5`}>
          <div>
            <h2 className="font-display text-2xl font-medium">SEO</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Как статья выглядит в поисковиках и соцсетях. Подробнее — в
              разделе «Справка по SEO».
            </p>
          </div>

          <Field
            label="Ключевая фраза"
            htmlFor="focusKeyword"
            error={errors.focusKeyword}
            hint="Главный запрос, по которому статью должны находить. Используйте её в заголовке, первом абзаце, адресе и описании."
          >
            <input
              id="focusKeyword"
              value={state.focusKeyword}
              onChange={(e) => update("focusKeyword", e.target.value)}
              placeholder="Например: тревога причины"
              className={inputClass}
            />
          </Field>

          <Field
            label="SEO-заголовок (title)"
            htmlFor="seoTitle"
            error={errors.seoTitle}
            hint={
              <>
                Если пусто — используется заголовок статьи.{" "}
                <CharCounter
                  value={state.seoTitle || state.title}
                  limits={SEO_LIMITS.title}
                />
              </>
            }
          >
            <input
              id="seoTitle"
              value={state.seoTitle}
              onChange={(e) => update("seoTitle", e.target.value)}
              placeholder={state.title}
              className={inputClass}
            />
          </Field>

          <Field
            label="SEO-описание (meta description)"
            htmlFor="seoDescription"
            error={errors.seoDescription}
            hint={
              <>
                Если пусто — используется анонс.{" "}
                <CharCounter
                  value={state.seoDescription || state.excerpt}
                  limits={SEO_LIMITS.description}
                />
              </>
            }
          >
            <textarea
              id="seoDescription"
              rows={3}
              value={state.seoDescription}
              onChange={(e) => update("seoDescription", e.target.value)}
              placeholder={state.excerpt}
              className={textareaClass}
            />
          </Field>

          <SnippetPreview
            title={state.seoTitle || state.title}
            slug={state.slug}
            description={state.seoDescription || state.excerpt}
            siteName={siteName}
          />

          <Field
            label="Дополнительные ключевые слова"
            htmlFor="keywords"
            error={errors.keywords}
            hint="Через запятую: синонимы и близкие запросы. Помогают держать фокус при написании."
          >
            <input
              id="keywords"
              value={state.keywordsText}
              onChange={(e) => update("keywordsText", e.target.value)}
              placeholder="тревожность, беспокойство, как справиться с тревогой"
              className={inputClass}
            />
          </Field>

          <details className="group rounded-[0.9rem] border border-border px-4 py-3">
            <summary className="cursor-pointer text-sm font-medium">
              Дополнительно
            </summary>
            <div className="mt-4 space-y-5">
              <ImageField
                label="Картинка для соцсетей (Open Graph)"
                hint="1200×630. Если не выбрана — используется обложка."
                image={ogImage}
                onChange={(image) => {
                  setOgImage(image);
                  update("ogImageId", image?.id ?? null);
                }}
              />
              <Field
                label="Канонический адрес"
                htmlFor="canonicalUrl"
                error={errors.canonicalUrl}
                hint="Только если статья — копия материала с другого адреса. Обычно оставьте пустым."
              >
                <input
                  id="canonicalUrl"
                  value={state.canonicalUrl}
                  onChange={(e) => update("canonicalUrl", e.target.value)}
                  placeholder="https://"
                  className={inputClass}
                />
              </Field>
              <label className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={state.noindex}
                  onChange={(e) => update("noindex", e.target.checked)}
                  className="mt-0.5 size-4 accent-[var(--accent)]"
                />
                <span>
                  Скрыть от поисковиков (noindex)
                  <span className="block text-xs text-muted-foreground">
                    Статья будет доступна по ссылке, но не попадёт в поиск и
                    sitemap.
                  </span>
                </span>
              </label>
            </div>
          </details>
        </section>
      </div>

      <aside className="space-y-6 xl:sticky xl:top-6">
        <section className={`${cardClass} space-y-4`}>
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Публикация</h2>
            <Badge tone={isPublished ? "accent" : "neutral"}>
              {statusLabels[initial.status]}
            </Badge>
          </div>
          {initial.publishedAt ? (
            <p className="text-sm text-muted-foreground">
              Опубликована {formatDate(initial.publishedAt)}
            </p>
          ) : null}
          {initial.updatedAt ? (
            <p className="text-sm text-muted-foreground">
              Изменена {formatDate(initial.updatedAt)}
            </p>
          ) : null}
          <div className="grid gap-2">
            {isPublished ? (
              <>
                <button
                  type="submit"
                  disabled={pending}
                  className={primaryButton}
                >
                  Сохранить изменения
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => submit("unpublish")}
                  className={secondaryButton}
                >
                  Снять с публикации
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => submit("publish")}
                  className={primaryButton}
                >
                  Опубликовать
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className={secondaryButton}
                >
                  Сохранить черновик
                </button>
              </>
            )}
          </div>
          <AutosaveIndicator status={autosave.status} isNew={!initial.id} />
          {message ? (
            <p
              role="status"
              className={
                message.tone === "ok"
                  ? "text-sm text-accent"
                  : "text-sm text-red-700 dark:text-red-400"
              }
            >
              {message.text}
            </p>
          ) : null}
          {initial.id ? (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-4 text-sm">
              <a
                href={`/admin/preview/${initial.id}`}
                onClick={openPreview}
                target="_blank"
                rel="noopener"
                className="text-accent hover:underline"
              >
                Предпросмотр
              </a>
              {isPublished ? (
                <a
                  href={`/articles/${initial.values.slug}`}
                  target="_blank"
                  rel="noopener"
                  className="text-accent hover:underline"
                >
                  На сайте
                </a>
              ) : null}
              <button
                type="button"
                disabled={pending}
                onClick={onDelete}
                className="ml-auto inline-flex items-center gap-1.5 text-red-700 transition hover:underline disabled:opacity-50 dark:text-red-400"
              >
                <Trash2 className="size-4" />
                Удалить
              </button>
            </div>
          ) : null}
        </section>

        <section className={`${cardClass} space-y-5`}>
          <Field label="Рубрика" htmlFor="categoryId" error={errors.categoryId}>
            <select
              id="categoryId"
              value={state.categoryId ?? ""}
              onChange={(e) =>
                update(
                  "categoryId",
                  e.target.value ? Number(e.target.value) : null,
                )
              }
              className={inputClass}
            >
              <option value="">Без рубрики</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>

          <ImageField
            label="Обложка"
            hint="Горизонтальная, от 1200 px по ширине. Alt — описание картинки для поисковиков и незрячих."
            image={cover}
            onChange={(image) => {
              setCover(image);
              update("coverImageId", image?.id ?? null);
            }}
          />

          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={state.featured}
              onChange={(e) => update("featured", e.target.checked)}
              className="mt-0.5 size-4 accent-[var(--accent)]"
            />
            <span>
              Показывать на главной
              <span className="block text-xs text-muted-foreground">
                В блоке «Статьи» — до трёх отмеченных.
              </span>
            </span>
          </label>
        </section>

        <SeoChecklist input={input} coverAlt={cover?.alt ?? null} />
      </aside>
    </form>
  );
}
