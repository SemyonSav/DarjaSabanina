import Image from "next/image";
import { Clock } from "lucide-react";
import type { Article } from "@/types";
import { formatDate } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/Button";
import { ArticleContent } from "@/components/articles/ArticleContent";

/** Статья целиком: используется на сайте и в предпросмотре админки */
export function ArticleView({ article }: { article: Article }) {
  return (
    <article className="mx-auto max-w-3xl">
      <p className="text-sm font-medium tracking-[0.12em] uppercase text-accent">
        {article.category?.name}
      </p>
      <h1 className="mt-3 font-display text-4xl font-medium leading-tight md:text-5xl lg:text-6xl">
        {article.title}
      </h1>

      <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        {article.publishedAt ? (
          <time dateTime={article.publishedAt}>
            {formatDate(article.publishedAt)}
          </time>
        ) : null}
        <span className="inline-flex items-center gap-1.5">
          <Clock className="size-4" />
          {article.readingTimeMinutes} мин чтения
        </span>
      </div>

      {article.cover ? (
        <div className="relative mt-10 aspect-[16/10] overflow-hidden rounded-[1.5rem] bg-sand shadow-soft">
          <Image
            src={article.cover.url}
            alt={article.cover.alt}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        </div>
      ) : null}

      <div className="mt-10">
        <ArticleContent article={article} />
      </div>

      <div className="mt-10 flex justify-center">
        <ButtonLink href="/#contact" size="lg">
          Записаться на консультацию
        </ButtonLink>
      </div>
    </article>
  );
}
