"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { aboutContent, directions, siteConfig } from "@/lib/site";
import { fadeInUp, staggerContainer, viewportOnce } from "@/lib/animations";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";

export function About() {
  return (
    <section id="about" className="scroll-mt-24 py-20 md:py-28">
      <Container>
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-sand shadow-soft"
          >
            <Image
              src={siteConfig.avatar}
              alt={`${siteConfig.name} — портрет`}
              fill
              sizes="(max-width: 1024px) 90vw, 520px"
              className="object-cover object-[50%_18%]"
            />
          </motion.div>

          <div>
            <SectionHeading
              eyebrow="Знакомство"
              title={aboutContent.title}
              description="Спокойное пространство, где можно разобраться в себе без спешки и оценок."
            />
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              {aboutContent.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <ButtonLink href="/#contact" className="mt-8">
              Записаться на консультацию
            </ButtonLink>
          </div>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {directions.map((item) => (
            <motion.article
              key={item.id}
              variants={fadeInUp}
              className="rounded-[1.4rem] border border-border bg-card p-6 shadow-soft transition hover:-translate-y-1 hover:border-accent/40"
            >
              <h3 className="font-display text-2xl font-medium">{item.title}</h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </motion.article>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
