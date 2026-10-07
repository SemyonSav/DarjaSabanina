import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { testimonials, type TestimonialRow } from "@/lib/db/schema";
import type { Testimonial } from "@/types";

export type TestimonialInput = Pick<
  TestimonialRow,
  "name" | "text" | "role" | "isPublished"
>;

const ordered = [asc(testimonials.sortOrder), asc(testimonials.id)];

function toTestimonial(row: TestimonialRow): Testimonial {
  return {
    id: String(row.id),
    name: row.name,
    text: row.text,
    role: row.role || undefined,
  };
}

export async function listPublishedTestimonials(): Promise<Testimonial[]> {
  const rows = await db.query.testimonials.findMany({
    where: eq(testimonials.isPublished, true),
    orderBy: ordered,
  });
  return rows.map(toTestimonial);
}

export async function listTestimonialsForAdmin(): Promise<TestimonialRow[]> {
  return db.query.testimonials.findMany({ orderBy: ordered });
}

export async function getTestimonialById(id: number) {
  return (
    (await db.query.testimonials.findFirst({
      where: eq(testimonials.id, id),
    })) ?? null
  );
}

export async function createTestimonial(
  data: TestimonialInput,
): Promise<number> {
  const last = await db.query.testimonials.findFirst({
    columns: { sortOrder: true },
    orderBy: [desc(testimonials.sortOrder)],
  });
  const [row] = await db
    .insert(testimonials)
    .values({ ...data, sortOrder: (last?.sortOrder ?? -1) + 1 })
    .returning({ id: testimonials.id });
  return row.id;
}

export async function updateTestimonial(
  id: number,
  data: Partial<TestimonialInput>,
): Promise<void> {
  await db.update(testimonials).set(data).where(eq(testimonials.id, id));
}

export async function deleteTestimonial(id: number): Promise<void> {
  await db.delete(testimonials).where(eq(testimonials.id, id));
}

/** Сохраняет порядок: позиция в массиве становится sort_order */
export async function reorderTestimonials(ids: number[]): Promise<void> {
  db.transaction((tx) => {
    ids.forEach((id, index) => {
      tx.update(testimonials)
        .set({ sortOrder: index })
        .where(eq(testimonials.id, id))
        .run();
    });
  });
}
