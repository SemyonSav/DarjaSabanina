import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ArticleSummary } from "@/types";
import { formatDate, cn } from "@/lib/utils";

/** Карточка статьи. Серверный компонент — без лишнего JS на клиенте */
export function ArticleCard({
  article,
  className,
}: {
  article: ArticleSummary;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-border bg-card shadow-soft transition hover:-translate-y-1 hover:border-accent/40",
        className,
      )}
    >
      {/* Дублирует ссылку заголовка: скрываем от клавиатуры и скринридеров */}
      <Link
        href={`/articles/${article.slug}`}
        tabIndex={-1}
        aria-hidden
        className="relative block aspect-[16/10] overflow-hidden bg-sand"
      >
        {article.cover ? (
          <Image
            src={article.cover.url}
            alt={article.cover.alt}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col p-6">
        {article.publishedAt ? (
          <time
            dateTime={article.publishedAt}
            className="text-sm text-muted-foreground"
          >
            {formatDate(article.publishedAt)}
          </time>
        ) : null}
        <h3 className="mt-2 font-display text-2xl font-medium leading-snug">
          <Link
            href={`/articles/${article.slug}`}
            className="transition hover:text-accent"
          >
            {article.title}
          </Link>
        </h3>
        <p className="mt-3 flex-1 text-muted-foreground leading-relaxed">
          {article.excerpt}
        </p>
        <Link
          href={`/articles/${article.slug}`}
          className="mt-5 inline-flex items-center gap-2 text-accent transition hover:gap-3"
        >
          Читать
          <span className="sr-only"> статью «{article.title}»</span>
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </article>
  );
}
