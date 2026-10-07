"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { resetBlock, saveBlock, saveLayout } from "@/lib/repos";
import {
  blockSchemas,
  layoutSchema,
  type BlockData,
  type BlockKey,
  type HomeLayout,
} from "@/lib/home/schema";

export type BlockResult =
  | { ok: true }
  | {
      ok: false;
      message: string;
      /** Ошибки по пути поля: "items.2.title" → текст */
      errors?: Record<string, string>;
    };

function isBlockKey(key: string): key is BlockKey {
  return key in blockSchemas;
}

function refreshSite() {
  revalidatePath("/", "layout");
}

export async function saveBlockAction(
  key: string,
  data: unknown,
): Promise<BlockResult> {
  await requireAdmin();
  if (!isBlockKey(key)) return { ok: false, message: "Неизвестный блок" };

  const parsed = blockSchemas[key].safeParse(data);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      errors[issue.path.join(".")] ??= issue.message;
    }
    return { ok: false, message: "Проверьте отмеченные поля", errors };
  }
  await saveBlock(key, parsed.data as BlockData<typeof key>);
  refreshSite();
  return { ok: true };
}

/** Вернуть исходное содержимое блока */
export async function resetBlockAction(key: string): Promise<BlockResult> {
  await requireAdmin();
  if (!isBlockKey(key)) return { ok: false, message: "Неизвестный блок" };
  await resetBlock(key);
  refreshSite();
  return { ok: true };
}

export async function saveLayoutAction(
  layout: HomeLayout,
): Promise<BlockResult> {
  await requireAdmin();
  const parsed = layoutSchema.safeParse(layout);
  if (!parsed.success) {
    return { ok: false, message: "Некорректный порядок блоков" };
  }
  await saveLayout(parsed.data);
  refreshSite();
  return { ok: true };
}
