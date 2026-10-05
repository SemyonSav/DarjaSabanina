"use client";

import { motion } from "framer-motion";
import {
  Award,
  Layers,
  Leaf,
  Lock,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { advantages } from "@/lib/site";
import { fadeInUp, staggerContainer, viewportOnce } from "@/lib/animations";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const icons: Record<string, LucideIcon> = {
  Leaf,
  Lock,
  UserRound,
  Layers,
  Award,
};

export function WhyMe() {
  return (
    <section className="scroll-mt-24 bg-warm/50 py-20 dark:bg-muted/30 md:py-28">
      <Container>
        <SectionHeading
          eyebrow="Доверие"
          title="Почему люди выбирают меня"
          description="Не обещания чудес, а профессиональная бережность и ясный процесс."
          align="center"
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mx-auto grid max-w-5xl gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {advantages.map((item) => {
            const Icon = icons[item.icon] ?? Leaf;
            return (
              <motion.article
                key={item.id}
                variants={fadeInUp}
                className="rounded-[1.4rem] border border-border border-t-2 border-t-accent/60 bg-card p-6 shadow-soft"
              >
                <span className="inline-flex size-12 items-center justify-center rounded-full bg-accent-soft text-accent">
                  <Icon className="size-6" />
                </span>
                <h3 className="mt-4 font-display text-2xl font-medium">
                  {item.title}
                </h3>
                <p className="mt-2 text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </motion.article>
            );
          })}
        </motion.div>
      </Container>
    </section>
  );
}
