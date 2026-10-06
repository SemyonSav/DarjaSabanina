import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import {
  ArticleListing,
  pageHref,
  parsePage,
  redirectFirstPage,
} from "@/components/articles/ArticleListing";
import { getArticlesPage, getCategoriesWithArticles } from "@/lib/cms";

export const dynamic = "force-dynamic";

const description =
  "Статьи о тревоге, психосоматике, отношениях и системных расстановках.";

interface PageProps {
  searchParams: Promise<{ page?: string | string[] }>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const page = parsePage((await searchParams).page) ?? 1;
  const title = page > 1 ? `Статьи — страница ${page}` : "Статьи";
  return {
    title,
    description,
    alternates: { canonical: pageHref("/articles", page) },
    openGraph: { title, description, url: pageHref("/articles", page) },
  };
}

export default async function ArticlesPage({ searchParams }: PageProps) {
  const rawPage = (await searchParams).page;
  redirectFirstPage(rawPage, "/articles");
  const page = parsePage(rawPage);
  const [data, categories] = await Promise.all([
    page ? getArticlesPage(page) : null,
    getCategoriesWithArticles(),
  ]);
  if (!data) notFound();

  return (
    <Container className="py-16 md:py-24">
      <ArticleListing
        eyebrow="Блог"
        title="Статьи"
        intro={
          <p>
            Материалы о внутренней опоре, теле, семье и бережных изменениях.
          </p>
        }
        articles={data.articles}
        categories={categories}
        basePath="/articles"
        page={data.page}
        pages={data.pages}
      />
    </Container>
  );
}
