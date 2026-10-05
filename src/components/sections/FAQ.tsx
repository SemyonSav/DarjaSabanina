"use client";

import { faqs } from "@/lib/site";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Accordion } from "@/components/ui/Accordion";
import { ButtonLink } from "@/components/ui/Button";

export function FAQ() {
  return (
    <section id="faq" className="scroll-mt-24 bg-warm/50 py-20 dark:bg-muted/30 md:py-28">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="FAQ"
              title="Частые вопросы"
              description="Если не нашли ответ — напишите, и я подскажу по вашему запросу."
            />
            <ButtonLink href="/#contact" variant="outline">
              Задать вопрос
            </ButtonLink>
          </div>
          <Accordion items={faqs} />
        </div>
      </Container>
    </section>
  );
}
