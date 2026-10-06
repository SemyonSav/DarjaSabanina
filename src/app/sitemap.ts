import type { MetadataRoute } from "next";
import { listPublishedSlugs } from "@/lib/repos";

export const dynamic = "force-dynamic";
import { siteConfig } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = (await listPublishedSlugs()).map((article) => ({
    url: `${siteConfig.url}/articles/${article.slug}`,
    lastModified: article.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteConfig.url}/articles`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteConfig.url}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    ...articles,
  ];
}
