import {
  Mail,
  Megaphone,
  MessageCircle,
  Phone,
  Send,
  type LucideIcon,
} from "lucide-react";
import type { BlockData } from "@/lib/home/schema";
import type { SiteContacts } from "@/lib/home/content";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

interface ContactItem {
  label: string;
  value: string;
  href: string;
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
      value: "Написать лично",
      href: contacts.telegram,
      external: true,
      icon: Send,
    },
    Boolean(contacts.telegramChannel) && {
      label: "Telegram-канал",
      value: "Читать канал",
      href: contacts.telegramChannel,
      external: true,
      icon: Megaphone,
    },
    Boolean(contacts.whatsapp) && {
      label: "WhatsApp",
      value: "Написать в WhatsApp",
      href: contacts.whatsapp,
      external: true,
      icon: MessageCircle,
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
        <SectionHeading {...data.heading} align="center" />

        <ul className="mx-auto flex max-w-5xl flex-wrap justify-center gap-4">
          {items.map((item) => (
            <li
              key={item.label}
              className="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc((100%-2rem)/3)]"
            >
              <a
                href={item.href}
                {...(item.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="flex h-full items-center gap-4 rounded-[1.35rem] border border-border bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-accent/40"
              >
                <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-[1rem] bg-accent-soft text-accent">
                  <item.icon className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm text-muted-foreground">
                    {item.label}
                  </span>
                  <span className="block break-words font-medium">
                    {item.value}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
