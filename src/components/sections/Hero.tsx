"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { heroContent, siteConfig } from "@/lib/site";
import { fadeInUp, staggerContainer, viewportOnce } from "@/lib/animations";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-16 pt-10 md:pb-24 md:pt-16">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-10 size-[28rem] rounded-full bg-sand/60 blur-3xl dark:bg-accent/10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 top-40 size-[22rem] rounded-full bg-accent-soft/80 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/3 size-64 rounded-full bg-beige/40 blur-3xl dark:bg-beige/10"
      />

      <Container>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16"
        >
          <motion.div variants={fadeInUp} className="relative order-2 lg:order-1">
            <p className="mb-4 text-sm font-medium tracking-[0.16em] uppercase text-accent">
              {heroContent.subheadline}
            </p>
            <h1 className="font-display text-5xl font-medium leading-[1.05] tracking-tight text-foreground md:text-6xl lg:text-7xl">
              {heroContent.headline}
            </h1>
            <div className="mt-6 max-w-xl space-y-3 text-lg leading-relaxed text-muted-foreground">
              {heroContent.lead.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/#contact" size="lg">
                Записаться на консультацию
              </ButtonLink>
              <ButtonLink href="/articles" variant="outline" size="lg">
                Читать статьи
                <ArrowRight className="size-4" />
              </ButtonLink>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              Онлайн-консультации
            </p>
          </motion.div>

          <motion.div variants={fadeInUp} className="order-1 lg:order-2">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[1.75rem] bg-sand shadow-soft lg:max-w-none">
              <Image
                src={siteConfig.avatar}
                alt={`${siteConfig.name} — психолог, психосоматолог, расстановщик`}
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 480px"
                className="object-cover object-[50%_20%]"
              />
            </div>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
