import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Clock } from "lucide-react";
import {
  ArticleContent,
  RelatedArticles,
} from "@/components/articles/ArticleContent";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { getArticleBySlug, getRelatedArticles } from "@/lib/cms";
import { toArticleSummary } from "@/types";
import { formatDate } from "@/lib/utils";
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

      <RelatedArticles articles={related.map(toArticleSummary)} />
    </Container>
  );
}
