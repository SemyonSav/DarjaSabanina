import type { Article, ArticleSummary } from "@/types";
import { ButtonLink } from "@/components/ui/Button";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { ArticleBody } from "@/components/articles/ArticleBody";

export function ArticleContent({ article }: { article: Article }) {
  return (
    <div>
      <ArticleBody content={article.content} />

      <div className="mt-12 rounded-[1.5rem] border border-border bg-accent-soft/60 p-8 text-center">
        <p className="font-display text-2xl font-medium text-foreground md:text-3xl">
          Готовы разобрать ваш запрос бережно и по делу?
        </p>
        <ButtonLink href="/#contact" className="mt-6">
          Записаться на консультацию
        </ButtonLink>
      </div>
    </div>
  );
}

export function RelatedArticles({ articles }: { articles: ArticleSummary[] }) {
  if (!articles.length) return null;

  return (
    <section className="mt-20 border-t border-border pt-16">
      <h2 className="font-display text-3xl font-medium md:text-4xl">
        Другие статьи
      </h2>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>
    </section>
  );
}
