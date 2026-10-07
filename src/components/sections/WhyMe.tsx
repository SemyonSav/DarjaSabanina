"use client";

import { motion } from "framer-motion";
import type { BlockData } from "@/lib/home/schema";
import { iconComponents } from "@/components/ui/icons";
import { RichText } from "@/components/ui/RichText";
import { fadeInUp, staggerContainer, viewportOnce } from "@/lib/animations";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function WhyMe({ data }: { data: BlockData<"advantages"> }) {
  return (
    <section id="why" className="scroll-mt-24 bg-warm/50 py-20 dark:bg-muted/30 md:py-28">
      <Container>
        <SectionHeading {...data.heading} align="center" />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mx-auto grid max-w-5xl gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {data.items.map((item, i) => {
            const Icon = iconComponents[item.icon];
            return (
              <motion.article
                key={`${i}-${item.title}`}
                variants={fadeInUp}
                className="rounded-[1.4rem] border border-border border-t-2 border-t-accent/60 bg-card p-6 shadow-soft"
              >
                <span className="inline-flex size-12 items-center justify-center rounded-full bg-accent-soft text-accent">
                  <Icon className="size-6" />
                </span>
                <h3 className="mt-4 font-display text-2xl font-medium">
                  {item.title}
                </h3>
                <RichText
                  value={item.description}
                  paragraphClassName="mt-2 text-muted-foreground leading-relaxed"
                />
              </motion.article>
            );
          })}
        </motion.div>
      </Container>
    </section>
  );
}
