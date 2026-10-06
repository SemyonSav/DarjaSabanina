"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { paragraphs, type BlockData } from "@/lib/home/schema";
import { fadeInUp, viewportOnce } from "@/lib/animations";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";

export function Constellations({ data }: { data: BlockData<"method"> }) {
  return (
    <section
      id="constellations"
      className="relative scroll-mt-24 overflow-hidden bg-accent-soft/60 py-20 dark:bg-accent-soft/30 md:py-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-1/3 size-[26rem] rounded-full bg-accent/10 blur-3xl"
      />
      <Container className="relative">
        <div className="grid items-start gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div>
            <SectionHeading {...data.heading} />
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              className="space-y-4 text-lg leading-relaxed text-muted-foreground"
            >
              {paragraphs(data.intro).map((p) => (
                <p key={p} className="text-xl text-foreground">
                  {p}
                </p>
              ))}
              {data.sections.map((section, i) => (
                <div key={`${i}-${section.heading}`} className="space-y-4">
                  {section.heading ? (
                    <h3 className="pt-2 font-display text-2xl font-medium text-foreground">
                      {section.heading}
                    </h3>
                  ) : null}
                  {paragraphs(section.text).map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
              ))}
            </motion.div>
            {data.moreLabel && data.moreHref ? (
              <ButtonLink href={data.moreHref} variant="outline" className="mt-8">
                {data.moreLabel}
                <ArrowRight className="size-4" />
              </ButtonLink>
            ) : null}
          </div>

          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="relative overflow-hidden rounded-[1.75rem] bg-accent p-8 text-accent-foreground shadow-soft md:p-10 lg:sticky lg:top-28"
          >
            <div
              aria-hidden
              className="absolute -right-12 -top-12 size-48 rounded-full bg-white/10 blur-2xl"
            />
            <div
              aria-hidden
              className="absolute -bottom-16 -left-10 size-44 rounded-full bg-black/10 blur-2xl"
            />
            <p className="relative font-display text-3xl font-medium leading-snug md:text-4xl">
              {data.slogan}
            </p>
            {data.sloganNote ? (
              <p className="relative mt-6 text-accent-foreground/80">
                {data.sloganNote}
              </p>
            ) : null}
            {data.ctaLabel ? (
              <ButtonLink
                href="/#contact"
                className="relative mt-8 bg-accent-foreground text-accent hover:brightness-95"
              >
                {data.ctaLabel}
              </ButtonLink>
            ) : null}
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
