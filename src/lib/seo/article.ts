import type { Metadata } from "next";
import type { Article, MediaImage } from "@/types";
import { siteConfig } from "@/lib/site";
import type { SiteImage, SiteSettings } from "@/lib/home/content";
import { articlePath } from "@/lib/paths";

/**
 * Картинка для соцсетей: OG-картинка статьи, затем обложка.
 * SVG соцсети не показывают — тогда берём общую картинку сайта.
 */
export function shareImage(
  article: Article,
  settings: SiteSettings,
): MediaImage | SiteImage {
  const candidate = [article.ogImage, article.cover].find(
    (image) => image && !image.url.endsWith(".svg"),
  );
  return candidate ?? settings.shareImage;
}

export function articleUrl(article: Pick<Article, "slug">): string {
  return `${siteConfig.url}${articlePath(article.slug)}`;
}

export function buildArticleMetadata(
  article: Article,
  settings: SiteSettings,
): Metadata {
  const title = article.seoTitle || article.title;
  const description = article.description;
  const canonical = article.canonicalUrl || articleUrl(article);
  const image = shareImage(article, settings);
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
    authors: [{ name: settings.name, url: siteConfig.url }],
    openGraph: {
      type: "article",
      url: articleUrl(article),
      siteName: settings.name,
      locale: siteConfig.locale,
      title,
      description,
      publishedTime: article.publishedAt ?? undefined,
      modifiedTime: article.updatedAt,
      authors: [settings.name],
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
