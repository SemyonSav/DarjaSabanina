import { z } from "zod";
import { SLUG_MAX_LENGTH, SLUG_PATTERN } from "@/lib/slug";
import { SEO_LIMITS } from "./article";

export const categoryInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Укажите название")
    .max(80, "Не длиннее 80 символов"),
  slug: z
    .string()
    .trim()
    .min(1, "Укажите адрес")
    .max(SLUG_MAX_LENGTH, `Не длиннее ${SLUG_MAX_LENGTH} символов`)
    .regex(SLUG_PATTERN, "Только латиница в нижнем регистре, цифры и дефисы"),
  description: z.string().trim().max(2000, "Не длиннее 2000 символов"),
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
  sortOrder: z.number().int().min(0).max(10000),
});

export type CategoryInput = z.infer<typeof categoryInputSchema>;
export type CategoryFieldErrors = Partial<Record<keyof CategoryInput, string>>;
