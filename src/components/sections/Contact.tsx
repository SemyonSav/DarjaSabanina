"use client";

import {
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  type LucideIcon,
} from "lucide-react";
import type { BlockData } from "@/lib/home/schema";
import type { SiteContacts } from "@/lib/home/content";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ContactForm } from "@/components/sections/ContactForm";

const cardClass =
  "flex items-center gap-4 rounded-[1.35rem] border border-border bg-card p-5 shadow-soft";

interface ContactItem {
  label: string;
  value: string;
  href?: string;
  external?: boolean;
  icon: LucideIcon;
}

/** Только заполненные в админке контакты */
function contactItems(contacts: SiteContacts): ContactItem[] {
  const items: (ContactItem | false)[] = [
    Boolean(contacts.phone) && {
      label: "Телефон",
      value: contacts.phone,
      href: contacts.phoneHref,
      icon: Phone,
    },
    Boolean(contacts.email) && {
      label: "Email",
      value: contacts.email,
      href: `mailto:${contacts.email}`,
      icon: Mail,
    },
    Boolean(contacts.telegram) && {
      label: "Telegram",
      value: "Написать в Telegram",
      href: contacts.telegram,
      external: true,
      icon: Send,
    },
    Boolean(contacts.whatsapp) && {
      label: "WhatsApp",
      value: "Написать в WhatsApp",
      href: contacts.whatsapp,
      external: true,
      icon: MessageCircle,
    },
    Boolean(contacts.address) && {
      label: "Адрес",
      value: contacts.address,
      icon: MapPin,
    },
  ];
  return items.filter((item): item is ContactItem => Boolean(item));
}

export function Contact({
  data,
  contacts,
}: {
  data: BlockData<"contact">;
  contacts: SiteContacts;
}) {
  const items = contactItems(contacts);
  return (
    <section
      id="contact"
      className="scroll-mt-24 bg-gradient-to-b from-background to-sand/40 py-20 dark:to-muted/20 md:py-28"
    >
      <Container>
        <SectionHeading {...data.heading} />

        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            {items.map((item) => {
              const content = (
                <>
                  <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-[1rem] bg-accent-soft text-accent">
                    <item.icon className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="font-medium">{item.value}</p>
                  </div>
                </>
              );
              return item.href ? (
                <a
                  key={item.label}
                  href={item.href}
                  {...(item.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className={`${cardClass} transition hover:border-accent/40`}
                >
                  {content}
                </a>
              ) : (
                <div key={item.label} className={cardClass}>
                  {content}
                </div>
              );
            })}

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
