import { z } from "zod";
import type { JSONContent } from "@tiptap/core";
import { SLUG_MAX_LENGTH, SLUG_PATTERN } from "@/lib/slug";

/** Рекомендации по длине для сниппета в поисковой выдаче */
export const SEO_LIMITS = {
  title: { min: 30, max: 60, hard: 120 },
  description: { min: 120, max: 160, hard: 300 },
  excerpt: { max: 300 },
} as const;

const optionalId = z.number().int().positive().nullable();

/** Адреса внутри /articles/, занятые разделами сайта */
const RESERVED_SLUGS = new Set(["category"]);

export const articleInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Укажите заголовок")
    .max(200, "Не длиннее 200 символов"),
  slug: z
    .string()
    .trim()
    .min(1, "Укажите адрес статьи")
    .max(SLUG_MAX_LENGTH, `Не длиннее ${SLUG_MAX_LENGTH} символов`)
    .regex(SLUG_PATTERN, "Только латиница в нижнем регистре, цифры и дефисы")
    .refine((slug) => !RESERVED_SLUGS.has(slug), "Этот адрес зарезервирован"),
  categoryId: optionalId,
  excerpt: z
    .string()
    .trim()
    .max(
      SEO_LIMITS.excerpt.max,
      `Не длиннее ${SEO_LIMITS.excerpt.max} символов`,
    ),
  content: z.custom<JSONContent>(
    (value) =>
      typeof value === "object" &&
      value !== null &&
      (value as JSONContent).type === "doc",
    "Некорректное содержимое статьи",
  ),
  coverImageId: optionalId,
  featured: z.boolean(),
  seoTitle: z
    .string()
    .trim()
    .max(SEO_LIMITS.title.hard, `Не длиннее ${SEO_LIMITS.title.hard} символов`),
  seoDescription: z
    .string()
    .trim()
    .max(
      SEO_LIMITS.description.hard,
      `Не длиннее ${SEO_LIMITS.description.hard} символов`,
    ),
  focusKeyword: z.string().trim().max(100, "Не длиннее 100 символов"),
  keywords: z
    .array(z.string().trim().min(1).max(100))
    .max(20, "Не больше 20 ключевых слов"),
  canonicalUrl: z.union([
    z.literal(""),
    z.url({ protocol: /^https?$/, error: "Укажите полный адрес с https://" }),
  ]),
  noindex: z.boolean(),
  ogImageId: optionalId,
});

export type ArticleInput = z.infer<typeof articleInputSchema>;

export type FieldErrors = Partial<Record<keyof ArticleInput, string>>;

export function collectFieldErrors(error: z.ZodError): FieldErrors {
  const errors: FieldErrors = {};
  for (const issue of error.issues) {
    const field = issue.path[0] as keyof ArticleInput | undefined;
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}

/** «тревога, панические атаки ,  » → ["тревога", "панические атаки"] */
export function parseKeywords(value: string): string[] {
  const seen = new Set<string>();
  return value
    .split(",")
    .map((k) => k.trim())
    .filter((k) => {
      const key = k.toLowerCase();
      if (!k || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

/**
 * Мягкая схема для автосохранения: проверяет только типы и разумные
 * размеры, чтобы незаконченная статья (пустой адрес и т. п.) тоже сохранялась.
 */
export const articleDraftSchema = z.object({
  title: z.string().max(1000),
  slug: z.string().max(300),
  categoryId: optionalId,
  excerpt: z.string().max(5000),
  content: articleInputSchema.shape.content,
  coverImageId: optionalId,
  featured: z.boolean(),
  seoTitle: z.string().max(1000),
  seoDescription: z.string().max(5000),
  focusKeyword: z.string().max(500),
  keywords: z.array(z.string().max(500)).max(100),
  canonicalUrl: z.string().max(2000),
  noindex: z.boolean(),
  ogImageId: optionalId,
}) satisfies z.ZodType<ArticleInput>;
