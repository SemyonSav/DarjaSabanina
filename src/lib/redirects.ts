import { permanentRedirect } from "next/navigation";
import { findRedirect } from "@/lib/repos";

/**
 * Если страница переехала (сменили адрес статьи или рубрики) —
 * постоянный редирект на новый адрес, чтобы не терять позиции в поиске.
 */
export async function redirectIfMoved(path: string): Promise<void> {
  const target = await findRedirect(path);
  if (target) permanentRedirect(target);
}
