"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import {
  createTestimonial,
  deleteTestimonial,
  reorderTestimonials,
  updateTestimonial,
} from "@/lib/repos";

const testimonialSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Укажите имя")
    .max(80, "Не длиннее 80 символов"),
  role: z.string().trim().max(120, "Не длиннее 120 символов"),
  text: z
    .string()
    .trim()
    .min(10, "Слишком короткий отзыв")
    .max(2000, "Не длиннее 2000 символов"),
  isPublished: z.boolean(),
});

export type TestimonialInput = z.infer<typeof testimonialSchema>;
export type TestimonialErrors = Partial<Record<keyof TestimonialInput, string>>;

export type TestimonialResult =
  { ok: true } | { ok: false; message: string; errors?: TestimonialErrors };

function refresh() {
  revalidatePath("/", "layout");
}

export async function saveTestimonial(
  id: number | null,
  input: TestimonialInput,
): Promise<TestimonialResult> {
  await requireAdmin();
  const parsed = testimonialSchema.safeParse(input);
  if (!parsed.success) {
    const errors: TestimonialErrors = {};
    for (const issue of parsed.error.issues) {
      errors[issue.path[0] as keyof TestimonialInput] ??= issue.message;
    }
    return { ok: false, message: "Проверьте поля", errors };
  }
  if (id) {
    await updateTestimonial(id, parsed.data);
  } else {
    await createTestimonial(parsed.data);
  }
  refresh();
  return { ok: true };
}

export async function setTestimonialPublished(
  id: number,
  isPublished: boolean,
): Promise<void> {
  await requireAdmin();
  await updateTestimonial(id, { isPublished });
  refresh();
}

export async function deleteTestimonialAction(id: number): Promise<void> {
  await requireAdmin();
  await deleteTestimonial(id);
  refresh();
}

export async function reorderTestimonialsAction(ids: number[]): Promise<void> {
  await requireAdmin();
  const parsed = z.array(z.number().int().positive()).max(500).safeParse(ids);
  if (!parsed.success) return;
  await reorderTestimonials(parsed.data);
  refresh();
}
