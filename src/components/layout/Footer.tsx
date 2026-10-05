import Link from "next/link";
import { navItems, siteConfig } from "@/lib/site";
import { Container } from "@/components/ui/Container";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-warm/60 dark:bg-muted/40">
      <Container className="grid gap-10 py-14 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <p className="font-display text-3xl font-medium">{siteConfig.name}</p>
          <p className="mt-3 max-w-sm text-muted-foreground">
            {siteConfig.title}. Бережная поддержка и ясность в сложные периоды
            жизни.
          </p>
        </div>

        <div>
          <p className="mb-4 text-sm font-medium tracking-[0.12em] uppercase text-accent">
            Навигация
          </p>
          <ul className="space-y-2">
            {navItems.map((item) => (
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
            <li>
              <a href={siteConfig.phoneHref} className="hover:text-foreground">
                {siteConfig.phone}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${siteConfig.email}`}
                className="hover:text-foreground"
              >
                {siteConfig.email}
              </a>
            </li>
            <li>
              <a
                href={siteConfig.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground"
              >
                Telegram
              </a>
            </li>
            <li>
              <a
                href={siteConfig.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground"
              >
                WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </Container>

      <Container className="flex flex-col gap-3 border-t border-border py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {year} {siteConfig.name}. Все права защищены.
        </p>
        <Link href="/privacy" className="hover:text-foreground">
          Политика конфиденциальности
        </Link>
      </Container>
    </footer>
  );
}
