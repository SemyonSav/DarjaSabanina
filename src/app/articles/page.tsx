import type { Metadata } from "next";
import { toArticleSummary } from "@/types";
import { ArticleCard } from "@/components/sections/Blog";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { getArticles } from "@/lib/cms";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Статьи",
  description:
    "Статьи о тревоге, психосоматике, отношениях и системных расстановках.",
  openGraph: {
    title: "Статьи",
    description:
      "Статьи о тревоге, психосоматике, отношениях и системных расстановках.",
  },
};

export default async function ArticlesPage() {
  const articles = await getArticles();

  return (
    <Container className="py-16 md:py-24">
      <div className="max-w-2xl">
        <p className="text-sm font-medium tracking-[0.14em] uppercase text-accent">
          Блог
        </p>
        <h1 className="mt-3 font-display text-5xl font-medium md:text-6xl">
          Статьи
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Материалы о внутренней опоре, теле, семье и бережных изменениях.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={toArticleSummary(article)} />
        ))}
      </div>

      <div className="mt-16 rounded-[1.5rem] border border-border bg-warm/70 p-8 text-center dark:bg-muted/40">
        <p className="font-display text-2xl md:text-3xl">
          Хотите разобрать свой запрос лично?
        </p>
        <ButtonLink href="/#contact" className="mt-6">
          Записаться на консультацию
        </ButtonLink>
      </div>
    </Container>
  );
}
