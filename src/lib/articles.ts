import type { LegacyArticle } from "@/types";
import {
  legacyArticles as articles,
  legacyTestimonials as testimonials,
} from "../../scripts/seed-data";

export { articles, testimonials };

/** CMS-ready API layer */
export function getArticles(): LegacyArticle[] {
  return [...articles].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export function getFeaturedArticles(limit = 3): LegacyArticle[] {
  const featured = getArticles().filter((a) => a.featured);
  const list = featured.length ? featured : getArticles();
  return list.slice(0, limit);
}

export function getArticleBySlug(slug: string): LegacyArticle | undefined {
  return articles.find((a) => a.slug === slug);
}

export function getRelatedArticles(slug: string, limit = 3): LegacyArticle[] {
  return getArticles()
    .filter((a) => a.slug !== slug)
    .slice(0, limit);
}

export function getAllArticleSlugs(): string[] {
  return articles.map((a) => a.slug);
}
