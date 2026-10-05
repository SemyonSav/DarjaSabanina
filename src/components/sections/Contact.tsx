"use client";

import { Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { siteConfig } from "@/lib/site";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ContactForm } from "@/components/sections/ContactForm";

export function Contact() {
  return (
    <section id="contact" className="scroll-mt-24 py-20 md:py-28">
      <Container>
        <SectionHeading
          eyebrow="Контакты"
          title="Давайте познакомимся"
          description="Оставьте заявку — я отвечу и помогу выбрать удобный формат встречи."
        />

        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            <a
              href={siteConfig.phoneHref}
              className="flex items-center gap-4 rounded-[1.35rem] border border-border bg-card p-5 shadow-soft transition hover:border-accent/40"
            >
              <span className="inline-flex size-11 items-center justify-center rounded-[1rem] bg-accent-soft text-accent">
                <Phone className="size-5" />
              </span>
              <div>
                <p className="text-sm text-muted-foreground">Телефон</p>
                <p className="font-medium">{siteConfig.phone}</p>
              </div>
            </a>

            <a
              href={`mailto:${siteConfig.email}`}
              className="flex items-center gap-4 rounded-[1.35rem] border border-border bg-card p-5 shadow-soft transition hover:border-accent/40"
            >
              <span className="inline-flex size-11 items-center justify-center rounded-[1rem] bg-accent-soft text-accent">
                <Mail className="size-5" />
              </span>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{siteConfig.email}</p>
              </div>
            </a>

            <a
              href={siteConfig.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-[1.35rem] border border-border bg-card p-5 shadow-soft transition hover:border-accent/40"
            >
              <span className="inline-flex size-11 items-center justify-center rounded-[1rem] bg-accent-soft text-accent">
                <Send className="size-5" />
              </span>
              <div>
                <p className="text-sm text-muted-foreground">Telegram</p>
                <p className="font-medium">Написать в Telegram</p>
              </div>
            </a>

            <a
              href={siteConfig.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-[1.35rem] border border-border bg-card p-5 shadow-soft transition hover:border-accent/40"
            >
              <span className="inline-flex size-11 items-center justify-center rounded-[1rem] bg-accent-soft text-accent">
                <MessageCircle className="size-5" />
              </span>
              <div>
                <p className="text-sm text-muted-foreground">WhatsApp</p>
                <p className="font-medium">Написать в WhatsApp</p>
              </div>
            </a>

            <div className="flex items-start gap-4 rounded-[1.35rem] border border-border bg-card p-5 shadow-soft">
              <span className="inline-flex size-11 items-center justify-center rounded-[1rem] bg-accent-soft text-accent">
                <MapPin className="size-5" />
              </span>
              <div>
                <p className="text-sm text-muted-foreground">Адрес</p>
                <p className="font-medium">{siteConfig.addressFull}</p>
              </div>
            </div>

            <div
              className="flex h-48 items-center justify-center rounded-[1.35rem] border border-dashed border-border bg-muted/60 text-sm text-muted-foreground"
              role="img"
              aria-label="Карта — заглушка"
            >
              Карта появится здесь (Google / Yandex Maps)
            </div>
          </div>

          <ContactForm />
        </div>
      </Container>
    </section>
  );
}
