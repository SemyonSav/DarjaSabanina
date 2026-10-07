import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { listTestimonialsForAdmin } from "@/lib/repos";
import { TestimonialManager } from "@/components/admin/testimonials/TestimonialManager";

export const metadata: Metadata = { title: "Отзывы" };

export default async function TestimonialsPage() {
  await requireAdmin();
  const items = await listTestimonialsForAdmin();
  return <TestimonialManager items={items} />;
}
