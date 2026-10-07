import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import {
  listArticlesForAdmin,
  listCategories,
  type AdminArticleSort,
} from "@/lib/repos";
import { articleStatuses, type ArticleStatus } from "@/lib/db/schema";
import { formatDate } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/Button";
import {
  Badge,
  EmptyState,
  PageHeader,
  inputClass,
} from "@/components/admin/ui";

export const metadata: Metadata = { title: "Статьи" };

const sorts: Record<AdminArticleSort, string> = {
  updated: "Недавно изменённые",
  published: "По дате публикации",
  title: "По названию",
};

const statusLabels: Record<ArticleStatus, string> = {
  draft: "Черновик",
  published: "Опубликована",
};

interface SearchParams {
  q?: string;
  status?: string;
  category?: string;
  sort?: string;
}

export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdmin();
  const params = await searchParams;

  const status = articleStatuses.find((s) => s === params.status);
  const sort = (Object.keys(sorts) as AdminArticleSort[]).find(
    (s) => s === params.sort,
  );
  const categoryId = Number(params.category) || undefined;
  const search = params.q?.trim() || undefined;

  const [articles, categories] = await Promise.all([
    listArticlesForAdmin({ search, status, categoryId, sort }),
    listCategories(),
  ]);
  const filtered = Boolean(search || status || categoryId);

  return (
    <>
      <PageHeader
        title="Статьи"
        description="Создание, редактирование и публикация статей блога."
        actions={
          <ButtonLink href="/admin/articles/new">
            <Plus className="size-4" />
            Новая статья
          </ButtonLink>
        }
      />

      <form
        method="get"
        className="mb-6 grid gap-3 md:grid-cols-[1fr_auto_auto_auto_auto]"
      >
        <label className="relative">
          <span className="sr-only">Поиск</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="q"
            defaultValue={search}
            placeholder="Поиск по заголовку или адресу"
            className={`${inputClass} pl-10`}
          />
        </label>
        <select
          name="status"
          defaultValue={status ?? ""}
          aria-label="Статус"
          className={inputClass}
        >
          <option value="">Все статусы</option>
          {articleStatuses.map((s) => (
            <option key={s} value={s}>
              {statusLabels[s]}
            </option>
          ))}
        </select>
        <select
          name="category"
          defaultValue={categoryId ?? ""}
          aria-label="Рубрика"
          className={inputClass}
        >
          <option value="">Все рубрики</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          name="sort"
          defaultValue={sort ?? "updated"}
          aria-label="Сортировка"
          className={inputClass}
        >
          {Object.entries(sorts).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="h-11 rounded-[0.9rem] border border-border px-5 text-[0.95rem] font-medium transition hover:border-accent hover:text-accent"
        >
          Применить
        </button>
      </form>

      {articles.length === 0 ? (
        <EmptyState>
          {filtered ? (
            <>
              Ничего не найдено.{" "}
              <Link href="/admin/articles" className="text-accent underline">
                Сбросить фильтры
              </Link>
            </>
          ) : (
            "Статей пока нет — создайте первую."
          )}
        </EmptyState>
      ) : (
        <div className="overflow-hidden rounded-[1.25rem] border border-border bg-card shadow-soft">
          <div className="hidden grid-cols-[1fr_10rem_8.5rem_9rem_9rem] gap-4 border-b border-border px-5 py-3 text-xs font-medium tracking-wide uppercase text-muted-foreground md:grid">
            <span>Заголовок</span>
            <span>Рубрика</span>
            <span>Статус</span>
            <span>Опубликована</span>
            <span>Изменена</span>
          </div>
          <ul className="divide-y divide-border">
            {articles.map((article) => (
              <li key={article.id}>
                <Link
                  href={`/admin/articles/${article.id}`}
                  className="grid gap-1.5 px-5 py-4 transition hover:bg-muted/50 md:grid-cols-[1fr_10rem_8.5rem_9rem_9rem] md:items-center md:gap-4"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium">
                      {article.title || "Без названия"}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      /articles/{article.slug}
                    </span>
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {article.category?.name ?? "—"}
                  </span>
                  <span>
                    <Badge
                      tone={article.status === "published" ? "accent" : "neutral"}
                    >
                      {statusLabels[article.status]}
                    </Badge>
                    {article.hasAutosave ? (
                      <span className="ml-1.5">
                        <Badge tone="warning">Есть правки</Badge>
                      </span>
                    ) : null}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {article.publishedAt ? formatDate(article.publishedAt) : "—"}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(article.updatedAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="mt-3 text-sm text-muted-foreground">
        Всего: {articles.length}
      </p>
    </>
  );
}
