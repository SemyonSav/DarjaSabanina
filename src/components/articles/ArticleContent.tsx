import type { Article, ArticleBlock } from "@/types";
import { ButtonLink } from "@/components/ui/Button";
import { ArticleCard } from "@/components/sections/Blog";

function Block({ block }: { block: ArticleBlock }) {
  switch (block.type) {
    case "heading":
      if (block.level === 3) {
        return <h3>{block.text}</h3>;
      }
      return <h2>{block.text}</h2>;
    case "quote":
      return (
        <blockquote>
          {block.text}
          {block.author ? (
            <footer className="mt-3 text-base not-italic text-muted-foreground">
              — {block.author}
            </footer>
          ) : null}
        </blockquote>
      );
    case "list":
      if (block.ordered) {
        return (
          <ol>
            {block.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        );
      }
      return (
        <ul>
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    default:
      return <p>{block.text}</p>;
  }
}

export function ArticleContent({ article }: { article: Article }) {
  return (
    <div className="prose-article">
      {article.content.map((block, i) => (
        <Block key={`${block.type}-${i}`} block={block} />
      ))}

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

export function RelatedArticles({ articles }: { articles: Article[] }) {
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
