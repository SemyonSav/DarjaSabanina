import Link from "next/link";
import type { SiteSettings } from "@/lib/home/content";
import { RichText } from "@/components/ui/RichText";
import { Container } from "@/components/ui/Container";

export function Footer({ settings }: { settings: SiteSettings }) {
  const { contacts } = settings;
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-warm/60 dark:bg-muted/40">
      <Container className="grid gap-10 py-14 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <p className="font-display text-3xl font-medium">{settings.name}</p>
          <div className="mt-3 max-w-sm space-y-2 text-muted-foreground">
            <RichText
              value={settings.footerText}
              prefix={`${settings.jobTitle}. `}
            />
          </div>
        </div>

        <div>
          <p className="mb-4 text-sm font-medium tracking-[0.12em] uppercase text-accent">
            Навигация
          </p>
          <ul className="space-y-2">
            {settings.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-muted-foreground transition hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/articles"
                className="text-muted-foreground transition hover:text-foreground"
              >
                Все статьи
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-4 text-sm font-medium tracking-[0.12em] uppercase text-accent">
            Контакты
          </p>
          <ul className="space-y-2 text-muted-foreground">
            {contacts.phone ? (
              <li>
                <a href={contacts.phoneHref} className="hover:text-foreground">
                  {contacts.phone}
                </a>
              </li>
            ) : null}
            {contacts.email ? (
              <li>
                <a
                  href={`mailto:${contacts.email}`}
                  className="hover:text-foreground"
                >
                  {contacts.email}
                </a>
              </li>
            ) : null}
            {contacts.telegram ? (
              <li>
                <a
                  href={contacts.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground"
                >
                  Telegram
                </a>
              </li>
            ) : null}
            {contacts.telegramChannel ? (
              <li>
                <a
                  href={contacts.telegramChannel}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground"
                >
                  Telegram-канал
                </a>
              </li>
            ) : null}
            {contacts.whatsapp ? (
              <li>
                <a
                  href={contacts.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground"
                >
                  WhatsApp
                </a>
              </li>
            ) : null}
          </ul>
        </div>
      </Container>

      <Container className="border-t border-border py-6 text-sm text-muted-foreground">
        <p>
          © {year} {settings.name}. Все права защищены.
        </p>
      </Container>
    </footer>
  );
}
