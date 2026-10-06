import Link from "next/link";
import { permanentRedirect } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Article, Category } from "@/types";
import { toArticleSummary } from "@/types";
import { cn } from "@/lib/utils";
import { categoryPath } from "@/lib/paths";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { ButtonLink } from "@/components/ui/Button";

/** /articles, /articles?page=2 — первая страница без параметра */
export function pageHref(basePath: string, page: number): string {
  return page <= 1 ? basePath : `${basePath}?page=${page}`;
}

/** ?page=1 дублирует первую страницу — переносим на адрес без параметра */
export function redirectFirstPage(
  value: string | string[] | undefined,
  basePath: string,
): void {
  if (value === "1") permanentRedirect(basePath);
}

/** Номер страницы из ?page=; null — если параметр некорректен */
export function parsePage(value: string | string[] | undefined): number | null {
  if (value === undefined) return 1;
  if (typeof value !== "string" || !/^[1-9]\d{0,4}$/.test(value)) return null;
  return Number(value);
}

function CategoryNav({
  categories,
  activeSlug,
}: {
  categories: { category: Category; count: number }[];
  activeSlug?: string;
}) {
  if (categories.length < 2) return null;
  const chip = (active: boolean) =>
    cn(
      "inline-flex h-10 items-center rounded-full border px-4 text-sm transition",
      active
        ? "border-accent bg-accent text-accent-foreground"
        : "border-border hover:border-accent hover:text-accent",
    );
  return (
    <nav aria-label="Рубрики" className="mt-8 flex flex-wrap gap-2">
      <Link
        href="/articles"
        className={chip(!activeSlug)}
        aria-current={!activeSlug ? "page" : undefined}
      >
        Все статьи
      </Link>
      {categories.map(({ category, count }) => (
        <Link
          key={category.id}
          href={categoryPath(category.slug)}
          className={chip(activeSlug === category.slug)}
          aria-current={activeSlug === category.slug ? "page" : undefined}
        >
          {category.name}
          <span className="ml-1.5 opacity-60">{count}</span>
        </Link>
      ))}
    </nav>
  );
}

function Pagination({
  basePath,
  page,
  pages,
}: {
  basePath: string;
  page: number;
  pages: number;
}) {
  if (pages <= 1) return null;
  const item =
    "inline-flex size-11 items-center justify-center rounded-full border transition";
  return (
    <nav
      aria-label="Страницы"
      className="mt-12 flex flex-wrap items-center justify-center gap-2"
    >
      {page > 1 ? (
        <Link
          href={pageHref(basePath, page - 1)}
          rel="prev"
          aria-label="Предыдущая страница"
          className={`${item} border-border hover:border-accent hover:text-accent`}
        >
          <ChevronLeft className="size-5" />
        </Link>
      ) : null}
      {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
        <Link
          key={n}
          href={pageHref(basePath, n)}
          aria-current={n === page ? "page" : undefined}
          className={cn(
            item,
            n === page
              ? "border-accent bg-accent text-accent-foreground"
              : "border-border hover:border-accent hover:text-accent",
          )}
        >
          {n}
        </Link>
      ))}
      {page < pages ? (
        <Link
          href={pageHref(basePath, page + 1)}
          rel="next"
          aria-label="Следующая страница"
          className={`${item} border-border hover:border-accent hover:text-accent`}
        >
          <ChevronRight className="size-5" />
        </Link>
      ) : null}
    </nav>
  );
}

/** Шапка, рубрики, карточки статей и пагинация */
export function ArticleListing({
  eyebrow,
  title,
  intro,
  articles,
  categories,
  activeCategorySlug,
  basePath,
  page,
  pages,
}: {
  eyebrow: string;
  title: string;
  intro: React.ReactNode;
  articles: Article[];
  categories: { category: Category; count: number }[];
  activeCategorySlug?: string;
  basePath: string;
  page: number;
  pages: number;
}) {
  return (
    <>
      <div className="max-w-2xl">
        <p className="text-sm font-medium tracking-[0.14em] uppercase text-accent">
          {eyebrow}
        </p>
        <h1 className="mt-3 font-display text-5xl font-medium md:text-6xl">
          {title}
          {page > 1 ? <span className="sr-only">, страница {page}</span> : null}
        </h1>
        <div className="mt-4 space-y-3 text-lg text-muted-foreground">
          {intro}
        </div>
      </div>

      <CategoryNav categories={categories} activeSlug={activeCategorySlug} />

      {articles.length ? (
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard
              key={article.slug}
              article={toArticleSummary(article)}
            />
          ))}
        </div>
      ) : (
        <p className="mt-12 rounded-[1.5rem] border border-dashed border-border px-6 py-12 text-center text-muted-foreground">
          Статей в этом разделе пока нет.
        </p>
      )}

      <Pagination basePath={basePath} page={page} pages={pages} />

      <div className="mt-16 rounded-[1.5rem] border border-border bg-warm/70 p-8 text-center dark:bg-muted/40">
        <p className="font-display text-2xl md:text-3xl">
          Хотите разобрать свой запрос лично?
        </p>
        <ButtonLink href="/#contact" className="mt-6">
          Записаться на консультацию
        </ButtonLink>
      </div>
    </>
  );
}
