import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import {
  ArticleListing,
  pageHref,
  parsePage,
  redirectFirstPage,
} from "@/components/articles/ArticleListing";
import {
  getArticlesPage,
  getCategoriesWithArticles,
  getCategoryBySlug,
} from "@/lib/cms";
import { categoryPath } from "@/lib/paths";
import { redirectIfMoved } from "@/lib/redirects";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { breadcrumbSchema, categoryCrumbs } from "@/lib/seo/jsonld";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const category = await getCategoryBySlug((await params).slug);
  if (!category) return {};
  const page = parsePage((await searchParams).page) ?? 1;
  const data = await getArticlesPage(page, category.id);

  const base = category.seoTitle || `Статьи: ${category.name}`;
  const title = page > 1 ? `${base} — страница ${page}` : base;
  const description =
    category.seoDescription ||
    category.description.slice(0, 160) ||
    `Статьи психолога в рубрике «${category.name}».`;
  const url = pageHref(categoryPath(category.slug), page);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url },
    // Пустая рубрика — «тонкая» страница, в поиск её не отдаём
    robots: data && data.total > 0 ? undefined : { index: false, follow: true },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) {
    await redirectIfMoved(categoryPath(slug));
    notFound();
  }
  const rawPage = (await searchParams).page;
  redirectFirstPage(rawPage, categoryPath(category.slug));
  const page = parsePage(rawPage);
  const [data, categories] = await Promise.all([
    page ? getArticlesPage(page, category.id) : null,
    getCategoriesWithArticles(),
  ]);
  if (!data) notFound();

  return (
    <Container className="py-16 md:py-24">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          ...breadcrumbSchema(categoryCrumbs(category)),
        }}
      />
      <Breadcrumbs items={categoryCrumbs(category)} />
      <ArticleListing
        eyebrow="Рубрика"
        title={category.name}
        intro={
          category.description
            ? category.description
                .split(/\n{2,}/)
                .map((paragraph) => <p key={paragraph}>{paragraph}</p>)
            : null
        }
        articles={data.articles}
        categories={categories}
        activeCategorySlug={category.slug}
        basePath={categoryPath(category.slug)}
        page={data.page}
        pages={data.pages}
      />
    </Container>
  );
}
