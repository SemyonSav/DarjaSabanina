"use client";

import { motion } from "framer-motion";
import type { BlockData } from "@/lib/home/schema";
import { iconComponents } from "@/components/ui/icons";
import { RichText } from "@/components/ui/RichText";
import { fadeInUp, staggerContainer, viewportOnce } from "@/lib/animations";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Requests({ data }: { data: BlockData<"requests"> }) {
  return (
    <section
      id="requests"
      className="scroll-mt-24 bg-warm py-20 dark:bg-muted/30 md:py-28"
    >
      <Container>
        <SectionHeading {...data.heading} />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {data.items.map((item, i) => {
            const Icon = iconComponents[item.icon];
            return (
              <motion.article
                key={`${i}-${item.title}`}
                variants={fadeInUp}
                className="group relative overflow-hidden rounded-[1.4rem] border border-border bg-card p-6 shadow-soft transition duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_16px_40px_rgba(107,127,106,0.14)]"
              >
                <span
                  aria-hidden
                  className="absolute right-5 top-3 font-display text-5xl font-medium text-accent/20"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="inline-flex size-12 items-center justify-center rounded-[1rem] bg-accent-soft text-accent">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-5 font-display text-2xl font-medium">
                  {item.title}
                </h3>
                <RichText
                  value={item.description}
                  paragraphClassName="mt-2 leading-relaxed text-muted-foreground"
                />
              </motion.article>
            );
          })}
        </motion.div>
      </Container>
    </section>
  );
}
