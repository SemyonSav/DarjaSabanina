import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Админка, API и предпросмотр черновиков не для поиска
      disallow: ["/admin", "/api/"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
