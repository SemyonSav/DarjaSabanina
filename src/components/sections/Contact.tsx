import {
  Mail,
  Megaphone,
  MessageCircle,
  Phone,
  Send,
  type LucideIcon,
} from "lucide-react";
import { siteConfig } from "@/lib/site";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

interface ContactItem {
  label: string;
  value: string;
  href: string;
  external?: boolean;
  icon: LucideIcon;
}

const items: ContactItem[] = [
  {
    label: "Телефон",
    value: siteConfig.phone,
    href: siteConfig.phoneHref,
    icon: Phone,
  },
  {
    label: "Email",
    value: siteConfig.email,
    href: `mailto:${siteConfig.email}`,
    icon: Mail,
  },
  {
    label: "Telegram",
    value: "Написать лично",
    href: siteConfig.telegram,
    external: true,
    icon: Send,
  },
  {
    label: "Telegram-канал",
    value: "Читать канал",
    href: siteConfig.telegramChannel,
    external: true,
    icon: Megaphone,
  },
  {
    label: "WhatsApp",
    value: "Написать в WhatsApp",
    href: siteConfig.whatsapp,
    external: true,
    icon: MessageCircle,
  },
];

export function Contact() {
  return (
    <section
      id="contact"
      className="scroll-mt-24 bg-gradient-to-b from-background to-sand/40 py-20 dark:to-muted/20 md:py-28"
    >
      <Container>
        <SectionHeading
          eyebrow="Контакты"
          title="Давайте познакомимся"
          description="Напишите или позвоните — я отвечу и помогу выбрать удобный формат встречи."
          align="center"
        />

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
