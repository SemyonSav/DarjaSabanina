import type { MetadataRoute } from "next";
import { listArticlesForSitemap, listCategoriesWithPublished } from "@/lib/repos";
import { siteConfig } from "@/lib/site";
import { articlePath, categoryPath } from "@/lib/paths";
import { mediaUrl } from "@/lib/repos/mappers";

export const dynamic = "force-dynamic";

const abs = (path: string) => `${siteConfig.url}${path}`;

/**
 * lastModified — реальная дата изменения, а не «сейчас»: иначе поисковики
 * перестают доверять этому полю и перепроверяют всё подряд.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, categories] = await Promise.all([
    listArticlesForSitemap(),
    listCategoriesWithPublished(),
  ]);

  const latest = articles.reduce<Date | undefined>(
    (max, a) => (!max || a.updatedAt > max ? a.updatedAt : max),
    undefined,
  );
  const latestInCategory = new Map<number, Date>();
  for (const article of articles) {
    if (!article.categoryId) continue;
    const current = latestInCategory.get(article.categoryId);
    if (!current || article.updatedAt > current) {
      latestInCategory.set(article.categoryId, article.updatedAt);
    }
  }

  return [
    { url: abs("/"), lastModified: latest, changeFrequency: "weekly", priority: 1 },
    {
      url: abs("/articles"),
      lastModified: latest,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...categories.map(({ category }) => ({
      url: abs(categoryPath(category.slug)),
      lastModified: latestInCategory.get(category.id),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...articles.map((article) => ({
      url: abs(articlePath(article.slug)),
      lastModified: article.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
      images: article.cover ? [abs(mediaUrl(article.cover.path))] : undefined,
    })),
    { url: abs("/privacy"), changeFrequency: "yearly", priority: 0.2 },
  ];
}
