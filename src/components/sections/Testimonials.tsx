"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import type { Testimonial } from "@/types";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Testimonials({ items }: { items: Testimonial[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, 7000);
    return () => window.clearInterval(id);
  }, [items.length]);

  const current = items[index];

  return (
    <section id="reviews" className="scroll-mt-24 py-20 md:py-28">
      <Container>
        <SectionHeading
          eyebrow="Отзывы"
          title="Истории тех, кто уже сделал шаг"
          description="Имена изменены. Тексты отражают типичный опыт работы."
          align="center"
        />

        <div className="relative mx-auto max-w-3xl">
          <div className="min-h-[280px] overflow-hidden rounded-[1.75rem] border border-border bg-card p-8 shadow-soft md:p-12">
            <Quote className="size-8 text-accent/70" />
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
                className="mt-6"
              >
                <p className="font-display text-2xl leading-relaxed md:text-3xl">
                  {current.text}
                </p>
                <div className="mt-8">
                  <p className="font-medium">{current.name}</p>
                  {current.role ? (
                    <p className="text-sm text-muted-foreground">{current.role}</p>
                  ) : null}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              aria-label="Предыдущий отзыв"
              onClick={() =>
                setIndex((i) => (i - 1 + items.length) % items.length)
              }
              className="inline-flex size-11 items-center justify-center rounded-full border border-border bg-card transition hover:border-accent hover:text-accent"
            >
              <ChevronLeft className="size-5" />
            </button>
            <div className="flex gap-2">
              {items.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  aria-label={`Отзыв ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={`h-2.5 rounded-full transition-all ${
                    i === index ? "w-8 bg-accent" : "w-2.5 bg-border"
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              aria-label="Следующий отзыв"
              onClick={() => setIndex((i) => (i + 1) % items.length)}
              className="inline-flex size-11 items-center justify-center rounded-full border border-border bg-card transition hover:border-accent hover:text-accent"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>
      </Container>
    </section>
  );
}
