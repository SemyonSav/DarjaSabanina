"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { constellationsIntro } from "@/lib/site";
import { fadeInUp, viewportOnce } from "@/lib/animations";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";

export function Constellations() {
  return (
    <section id="constellations" className="scroll-mt-24 py-20 md:py-28">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.9fr] lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="Метод"
              title={constellationsIntro.title}
            />
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              className="space-y-4 text-lg leading-relaxed text-muted-foreground"
            >
              <p className="text-xl text-foreground">
                {constellationsIntro.intro}
              </p>
              {constellationsIntro.sections.map((section) => (
                <div key={section.heading} className="space-y-4">
                  <h3 className="pt-2 font-display text-2xl font-medium text-foreground">
                    {section.heading}
                  </h3>
                  {section.paragraphs.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
              ))}
            </motion.div>
            <ButtonLink
              href={constellationsIntro.href}
              variant="outline"
              className="mt-8"
            >
              Подробнее
              <ArrowRight className="size-4" />
            </ButtonLink>
          </div>

          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="relative overflow-hidden rounded-[1.75rem] border border-border bg-gradient-to-br from-sand via-warm to-accent-soft p-8 shadow-soft md:p-10"
          >
            <div
              aria-hidden
              className="absolute -right-10 -top-10 size-40 rounded-full bg-accent/15 blur-2xl"
            />
            <p className="font-display text-3xl font-medium leading-snug md:text-4xl">
              {constellationsIntro.slogan}
            </p>
            <p className="mt-6 text-muted-foreground">
              {constellationsIntro.sloganNote}
            </p>
            <ButtonLink href="/#contact" className="mt-8">
              Записаться на расстановку
            </ButtonLink>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
