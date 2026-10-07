import { listPublishedArticles } from "@/lib/repos";
import { siteConfig } from "@/lib/site";
import { getSiteSettings } from "@/lib/home/content";
import { articlePath } from "@/lib/paths";

export const dynamic = "force-dynamic";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** CDATA не может содержать «]]>» — разбиваем его */
function cdata(value: string): string {
  return `<![CDATA[${value.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;
}

/** RSS 2.0: последние статьи с полным текстом (для Яндекса и агрегаторов) */
export async function GET() {
  const articles = (await listPublishedArticles({ limit: 30 })).filter(
    (a) => !a.noindex,
  );
  const site = siteConfig.url;
  const settings = await getSiteSettings();
  const author = settings.contacts.email
    ? `<author>${escapeXml(`${settings.contacts.email} (${settings.name})`)}</author>`
    : "";

  const items = articles
    .map((article) => {
      const url = `${site}${articlePath(article.slug)}`;
      const cover = article.cover
        ? `<enclosure url="${escapeXml(`${site}${article.cover.url}`)}" type="${article.cover.url.endsWith(".svg") ? "image/svg+xml" : "image/webp"}" length="0"/>`
        : "";
      return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(article.publishedAt ?? article.createdAt).toUTCString()}</pubDate>
      ${author}
      ${article.category ? `<category>${escapeXml(article.category.name)}</category>` : ""}
      <description>${escapeXml(article.description)}</description>
      ${cover}
      <content:encoded>${cdata(article.contentHtml)}</content:encoded>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${settings.name} — статьи`)}</title>
    <link>${site}/articles</link>
    <atom:link href="${site}/rss.xml" rel="self" type="application/rss+xml"/>
    <description>${escapeXml(settings.description)}</description>
    <language>ru</language>
    ${articles[0] ? `<lastBuildDate>${new Date(articles[0].updatedAt).toUTCString()}</lastBuildDate>` : ""}
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=600",
    },
  });
}
