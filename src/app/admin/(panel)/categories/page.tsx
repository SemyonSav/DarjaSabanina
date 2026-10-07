import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { countArticlesByCategory, listCategories } from "@/lib/repos";
import { CategoryManager } from "@/components/admin/categories/CategoryManager";

export const metadata: Metadata = { title: "Рубрики" };

export default async function CategoriesPage() {
  await requireAdmin();
  const [categories, counts] = await Promise.all([
    listCategories(),
    countArticlesByCategory(),
  ]);
  return (
    <CategoryManager
      categories={categories}
      counts={Object.fromEntries(counts)}
    />
  );
}
