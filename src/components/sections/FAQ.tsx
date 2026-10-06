"use client";

import type { BlockData } from "@/lib/home/schema";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Accordion } from "@/components/ui/Accordion";
import { ButtonLink } from "@/components/ui/Button";

export function FAQ({ data }: { data: BlockData<"faq"> }) {
  return (
    <section id="faq" className="scroll-mt-24 bg-warm/50 py-20 dark:bg-muted/30 md:py-28">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div>
            <SectionHeading {...data.heading} />
            {data.buttonLabel ? (
              <ButtonLink href="/#contact" variant="outline">
                {data.buttonLabel}
              </ButtonLink>
            ) : null}
          </div>
          <Accordion
            items={data.items.map((item, i) => ({ id: String(i), ...item }))}
          />
        </div>
      </Container>
    </section>
  );
}
