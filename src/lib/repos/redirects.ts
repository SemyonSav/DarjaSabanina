import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { redirects } from "@/lib/db/schema";

export async function findRedirect(fromPath: string): Promise<string | null> {
  const row = await db.query.redirects.findFirst({
    where: eq(redirects.fromPath, fromPath),
  });
  return row?.toPath ?? null;
}

export async function listRedirects() {
  return db.query.redirects.findMany();
}

/**
 * Добавляет 301 `from → to` без цепочек: старые редиректы на `from`
 * перенаправляются сразу на `to`, а редирект с `to` удаляется
 * (адрес снова занят живой страницей).
 */
export async function addRedirect(
  fromPath: string,
  toPath: string,
): Promise<void> {
  if (fromPath === toPath) return;
  db.transaction((tx) => {
    tx.delete(redirects).where(eq(redirects.fromPath, toPath)).run();
    tx.update(redirects)
      .set({ toPath })
      .where(eq(redirects.toPath, fromPath))
      .run();
    tx.insert(redirects)
      .values({ fromPath, toPath })
      .onConflictDoUpdate({ target: redirects.fromPath, set: { toPath } })
      .run();
  });
}

/** Освобождает адрес, если на нём снова появилась живая страница */
export async function removeRedirectFrom(fromPath: string): Promise<void> {
  await db.delete(redirects).where(eq(redirects.fromPath, fromPath));
}
