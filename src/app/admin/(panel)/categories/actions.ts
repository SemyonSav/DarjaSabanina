"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import {
  addRedirect,
  countArticlesByCategory,
  createCategory,
  deleteCategory,
  getCategoryById,
  isCategorySlugTaken,
  removeRedirectFrom,
  updateCategory,
} from "@/lib/repos";
import {
  categoryInputSchema,
  type CategoryFieldErrors,
  type CategoryInput,
} from "@/lib/validation/category";
import { categoryPath } from "@/lib/paths";
import { pluralRu } from "@/lib/utils";

export type CategoryResult =
  | { ok: true; id: number }
  | { ok: false; message: string; errors?: CategoryFieldErrors };

export async function saveCategory(
  id: number | null,
  input: CategoryInput,
): Promise<CategoryResult> {
  await requireAdmin();

  const parsed = categoryInputSchema.safeParse(input);
  if (!parsed.success) {
    const errors: CategoryFieldErrors = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof CategoryInput;
      errors[key] ??= issue.message;
    }
    return { ok: false, message: "Проверьте поля", errors };
  }
  const data = parsed.data;

  const existing = id ? await getCategoryById(id) : null;
  if (id && !existing) return { ok: false, message: "Рубрика не найдена" };

  if (await isCategorySlugTaken(data.slug, id ?? undefined)) {
    return {
      ok: false,
      message: "Проверьте поля",
      errors: { slug: "Такой адрес уже занят" },
    };
  }

  let savedId: number;
  if (existing) {
    await updateCategory(existing.id, data);
    savedId = existing.id;
    if (existing.slug !== data.slug) {
      await addRedirect(categoryPath(existing.slug), categoryPath(data.slug));
    }
  } else {
    savedId = await createCategory(data);
  }
  await removeRedirectFrom(categoryPath(data.slug));
  revalidatePath("/", "layout");
  return { ok: true, id: savedId };
}

export async function deleteCategoryAction(id: number): Promise<CategoryResult> {
  await requireAdmin();
  const counts = await countArticlesByCategory();
  const count = counts.get(id) ?? 0;
  if (count > 0) {
    return {
      ok: false,
      message: `В рубрике ${count} ${pluralRu(count, ["статья", "статьи", "статей"])} — перенесите их в другую рубрику, затем удалите.`,
    };
  }
  await deleteCategory(id);
  revalidatePath("/", "layout");
  return { ok: true, id };
}
