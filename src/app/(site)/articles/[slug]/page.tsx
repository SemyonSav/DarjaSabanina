import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RelatedArticles } from "@/components/articles/ArticleContent";
import { ArticleView } from "@/components/articles/ArticleView";
import { Container } from "@/components/ui/Container";
import { getArticleBySlug, getRelatedArticles } from "@/lib/cms";
import { toArticleSummary } from "@/types";
import { siteConfig } from "@/lib/site";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};

  return {
    title: article.title,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
      publishedTime: article.publishedAt ?? undefined,
      modifiedTime: article.updatedAt,
      images: article.cover
        ? [{ url: article.cover.url, alt: article.cover.alt }]
        : undefined,
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) notFound();

  const related = await getRelatedArticles(article, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    image: article.cover ? `${siteConfig.url}${article.cover.url}` : undefined,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: {
      "@type": "Person",
      name: siteConfig.name,
    },
  };

  return (
    <Container className="py-14 md:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ArticleView article={article} />

      <RelatedArticles articles={related.map(toArticleSummary)} />
    </Container>
  );
}
