import type { Metadata } from "next";
import type { Article, MediaImage } from "@/types";
import { siteConfig } from "@/lib/site";
import { articlePath } from "@/lib/paths";

/**
 * Картинка для соцсетей: OG-картинка статьи, затем обложка.
 * SVG соцсети не показывают — тогда берём общую картинку сайта.
 */
export function shareImage(
  article: Article,
): MediaImage | { url: string; alt: string } {
  const candidate = [article.ogImage, article.cover].find(
    (image) => image && !image.url.endsWith(".svg"),
  );
  return candidate ?? { url: siteConfig.ogImage, alt: siteConfig.name };
}

export function articleUrl(article: Pick<Article, "slug">): string {
  return `${siteConfig.url}${articlePath(article.slug)}`;
}

export function buildArticleMetadata(article: Article): Metadata {
  const title = article.seoTitle || article.title;
  const description = article.description;
  const canonical = article.canonicalUrl || articleUrl(article);
  const image = shareImage(article);
  const keywords = [article.focusKeyword, ...article.keywords].filter(Boolean);
  const images = [
    {
      url: image.url,
      alt: image.alt || article.title,
      ...("width" in image ? { width: image.width, height: image.height } : {}),
    },
  ];

  return {
    title,
    description,
    keywords: keywords.length ? keywords : undefined,
    alternates: { canonical },
    robots: article.noindex ? { index: false, follow: true } : undefined,
    authors: [{ name: siteConfig.name, url: siteConfig.url }],
    openGraph: {
      type: "article",
      url: articleUrl(article),
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      title,
      description,
      publishedTime: article.publishedAt ?? undefined,
      modifiedTime: article.updatedAt,
      authors: [siteConfig.name],
      section: article.category?.name,
      tags: keywords.length ? keywords : undefined,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image.url],
    },
  };
}
