import { desc, eq, like, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { articles, media, type MediaRow } from "@/lib/db/schema";

export type NewMedia = Omit<MediaRow, "id" | "createdAt">;

export async function listMedia(): Promise<MediaRow[]> {
  return db.query.media.findMany({ orderBy: [desc(media.id)] });
}

export async function getMediaById(id: number): Promise<MediaRow | null> {
  return (await db.query.media.findFirst({ where: eq(media.id, id) })) ?? null;
}

export async function getMediaByPath(path: string): Promise<MediaRow | null> {
  return (
    (await db.query.media.findFirst({ where: eq(media.path, path) })) ?? null
  );
}

export async function createMedia(data: NewMedia): Promise<MediaRow> {
  const [row] = await db.insert(media).values(data).returning();
  return row;
}

export async function updateMediaAlt(id: number, alt: string): Promise<void> {
  await db.update(media).set({ alt }).where(eq(media.id, id));
}

export async function deleteMedia(id: number): Promise<void> {
  await db.delete(media).where(eq(media.id, id));
}

/** Статьи, где картинка используется: обложка, OG-картинка или в тексте */
export async function findMediaUsage(
  row: Pick<MediaRow, "id" | "path">,
): Promise<{ id: number; title: string }[]> {
  return db
    .select({ id: articles.id, title: articles.title })
    .from(articles)
    .where(
      or(
        eq(articles.coverImageId, row.id),
        eq(articles.ogImageId, row.id),
        like(articles.content, `%${row.path}%`),
      ),
    );
}
