import { siteConfig } from "@/lib/site";

/**
 * IndexNow — мгновенное уведомление поисковиков об изменённых страницах.
 * Отправка в общий узел api.indexnow.org: его получают Яндекс, Bing и др.
 * Google IndexNow не поддерживает — ему хватает sitemap.
 */

const ENDPOINT = "https://api.indexnow.org/indexnow";

export function getIndexNowKey(): string | null {
  const key = process.env.INDEXNOW_KEY?.trim();
  // Требование протокола: 8–128 символов, латиница, цифры и дефис
  return key && /^[a-zA-Z0-9-]{8,128}$/.test(key) ? key : null;
}

function isPublicSite(): boolean {
  try {
    const { hostname } = new URL(siteConfig.url);
    return !["localhost", "127.0.0.1", "example.com"].includes(hostname);
  } catch {
    return false;
  }
}

export async function notifyIndexNow(paths: string[]): Promise<void> {
  const key = getIndexNowKey();
  if (!key || !paths.length || !isPublicSite()) return;

  const { host, origin } = new URL(siteConfig.url);
  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host,
        key,
        keyLocation: `${origin}/indexnow.txt`,
        urlList: [...new Set(paths)].map((path) => `${origin}${path}`),
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok && response.status !== 202) {
      console.warn(`IndexNow ответил ${response.status}`);
    }
  } catch (error) {
    console.warn("IndexNow недоступен", error);
  }
}
