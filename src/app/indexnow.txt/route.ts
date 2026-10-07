import { getIndexNowKey } from "@/lib/seo/indexnow";

/** Файл-ключ IndexNow: поисковик проверяет, что уведомления шлёт владелец */
export function GET() {
  const key = getIndexNowKey();
  if (!key) return new Response("Not found", { status: 404 });
  return new Response(key, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
