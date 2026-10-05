"use client";

import { motion } from "framer-motion";
import {
  Compass,
  HeartPulse,
  House,
  Shield,
  Sparkles,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { requests } from "@/lib/site";
import { fadeInUp, staggerContainer, viewportOnce } from "@/lib/animations";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const icons: Record<string, LucideIcon> = {
  HeartPulse,
  Users,
  House,
  Wallet,
  Compass,
  Shield,
};

export function Requests() {
  return (
    <section id="requests" className="scroll-mt-24 bg-warm/50 py-20 dark:bg-muted/30 md:py-28">
      <Container>
        <SectionHeading
          eyebrow="Запросы"
          title="С какими запросами я работаю"
          description="Вы можете прийти с конкретным симптомом или с ощущением, что «что-то не так». Вместе уточним фокус."
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {requests.map((item) => {
            const Icon = icons[item.icon] ?? Sparkles;
            return (
              <motion.article
                key={item.id}
                variants={fadeInUp}
                className="group rounded-[1.4rem] border border-border bg-card p-5 shadow-soft transition hover:-translate-y-1 hover:border-accent/50"
              >
                <span className="inline-flex size-11 items-center justify-center rounded-[1rem] bg-accent-soft text-accent transition group-hover:scale-105">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-4 font-display text-xl font-medium">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
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
