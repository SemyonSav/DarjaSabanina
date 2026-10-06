import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RelatedArticles } from "@/components/articles/ArticleContent";
import { ArticleView } from "@/components/articles/ArticleView";
import { Container } from "@/components/ui/Container";
import { getArticleBySlug, getRelatedArticles } from "@/lib/cms";
import { toArticleSummary } from "@/types";
import { buildArticleMetadata } from "@/lib/seo/article";
import { redirectIfMoved } from "@/lib/redirects";
import { articlePath } from "@/lib/paths";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import {
  articleCrumbs,
  blogPostingSchema,
  breadcrumbSchema,
  graph,
} from "@/lib/seo/jsonld";

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

  return buildArticleMetadata(article);
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    await redirectIfMoved(articlePath(slug));
    notFound();
  }

  const related = await getRelatedArticles(article, 3);

  return (
    <Container className="py-14 md:py-20">
      <JsonLd
        data={graph(
          blogPostingSchema(article),
          breadcrumbSchema(articleCrumbs(article)),
        )}
      />

      <div className="mx-auto max-w-3xl">
        <Breadcrumbs items={articleCrumbs(article)} />
      </div>
      <ArticleView article={article} />

      <RelatedArticles articles={related.map(toArticleSummary)} />
    </Container>
  );
}
