import { and, asc, eq, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import type { Category } from "@/types";
import { toCategory } from "./mappers";

type CategoryInput = Omit<Category, "id">;

export async function listCategories(): Promise<Category[]> {
  const rows = await db.query.categories.findMany({
    orderBy: [asc(categories.sortOrder), asc(categories.name)],
  });
  return rows.map((r) => toCategory(r)!);
}

export async function getCategoryBySlug(
  slug: string,
): Promise<Category | null> {
  return toCategory(
    await db.query.categories.findFirst({ where: eq(categories.slug, slug) }),
  );
}

export async function getCategoryById(id: number): Promise<Category | null> {
  return toCategory(
    await db.query.categories.findFirst({ where: eq(categories.id, id) }),
  );
}

export async function isCategorySlugTaken(slug: string, excludeId?: number) {
  const row = await db.query.categories.findFirst({
    columns: { id: true },
    where: excludeId
      ? and(eq(categories.slug, slug), ne(categories.id, excludeId))
      : eq(categories.slug, slug),
  });
  return Boolean(row);
}

export async function createCategory(data: CategoryInput): Promise<number> {
  const [row] = await db
    .insert(categories)
    .values(data)
    .returning({ id: categories.id });
  return row.id;
}

export async function updateCategory(
  id: number,
  data: Partial<CategoryInput>,
): Promise<void> {
  await db.update(categories).set(data).where(eq(categories.id, id));
}

export async function deleteCategory(id: number): Promise<void> {
  await db.delete(categories).where(eq(categories.id, id));
}
