import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { siteBlocks } from "@/lib/db/schema";
import {
  blockSchemas,
  HOME_SECTIONS,
  layoutSchema,
  type BlockData,
  type BlockKey,
  type HomeLayout,
} from "@/lib/home/schema";
import { blockDefaults, layoutDefaults } from "@/lib/home/defaults";

const LAYOUT_KEY = "layout";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Сохранённые данные поверх значений по умолчанию: поля, появившиеся
 * в коде позже, получают значение по умолчанию, а не ломают блок.
 */
export function mergeWithDefaults<T>(defaults: T, stored: unknown): T {
  if (!isPlainObject(defaults) || !isPlainObject(stored)) {
    return (stored === undefined ? defaults : stored) as T;
  }
  const result: Record<string, unknown> = { ...defaults };
  for (const [key, value] of Object.entries(stored)) {
    if (!(key in defaults)) continue;
    result[key] = isPlainObject(defaults[key])
      ? mergeWithDefaults(defaults[key], value)
      : value;
  }
  return result as T;
}

async function readRaw(key: string): Promise<unknown> {
  const row = await db.query.siteBlocks.findFirst({
    where: eq(siteBlocks.key, key),
  });
  return row?.data;
}

async function writeRaw(key: string, data: unknown): Promise<void> {
  await db
    .insert(siteBlocks)
    .values({ key, data })
    .onConflictDoUpdate({
      target: siteBlocks.key,
      set: { data, updatedAt: new Date() },
    });
}

export async function getBlock<K extends BlockKey>(
  key: K,
): Promise<BlockData<K>> {
  const defaults = blockDefaults[key];
  const stored = await readRaw(key);
  if (stored === undefined) return defaults;

  const parsed = blockSchemas[key].safeParse(
    mergeWithDefaults(defaults, stored),
  );
  if (parsed.success) return parsed.data as BlockData<K>;
  console.warn(
    `Блок «${key}» в БД некорректен — показаны значения по умолчанию`,
  );
  return defaults;
}

/** Блок был изменён в админке (иначе — значения по умолчанию) */
export async function isBlockCustomized(key: BlockKey): Promise<boolean> {
  return (await readRaw(key)) !== undefined;
}

export async function saveBlock<K extends BlockKey>(
  key: K,
  data: BlockData<K>,
): Promise<void> {
  await writeRaw(key, blockSchemas[key].parse(data));
}

export async function resetBlock(key: BlockKey): Promise<void> {
  await db.delete(siteBlocks).where(eq(siteBlocks.key, key));
}

/**
 * Порядок и видимость секций. Секции, которых нет в сохранённом
 * списке (добавлены в код позже), дописываются в конец.
 */
export async function getLayout(): Promise<HomeLayout> {
  const parsed = layoutSchema.safeParse(await readRaw(LAYOUT_KEY));
  if (!parsed.success) return layoutDefaults;
  const sections = parsed.data.sections;
  const missing = HOME_SECTIONS.filter(
    (key) => !sections.some((s) => s.key === key),
  );
  return {
    sections: [
      ...sections,
      ...layoutDefaults.sections.filter((s) => missing.includes(s.key)),
    ],
  };
}

export async function saveLayout(layout: HomeLayout): Promise<void> {
  await writeRaw(LAYOUT_KEY, layoutSchema.parse(layout));
}
