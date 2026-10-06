"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  ExternalLink,
  FileText,
  FolderTree,
  Image as ImageIcon,
  LogOut,
  Menu,
  MessageSquareQuote,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { logout } from "@/app/admin/actions";

interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

const navLinks: NavLink[] = [
  { href: "/admin/articles", label: "Статьи", icon: FileText },
  { href: "/admin/categories", label: "Рубрики", icon: FolderTree },
  { href: "/admin/testimonials", label: "Отзывы", icon: MessageSquareQuote },
  { href: "/admin/media", label: "Медиатека", icon: ImageIcon },
  { href: "/admin/seo-guide", label: "Справка по SEO", icon: BookOpen },
];

function Nav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Разделы админки" className="space-y-1">
      {navLinks.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-[0.9rem] px-3 py-2.5 text-[0.95rem] transition",
              active
                ? "bg-accent-soft font-medium text-accent"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-[1.1rem]" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFooter({ login }: { login: string }) {
  return (
    <div className="space-y-1 border-t border-border pt-4">
      <a
        href="/"
        target="_blank"
        rel="noopener"
        className="flex items-center gap-3 rounded-[0.9rem] px-3 py-2.5 text-[0.95rem] text-muted-foreground transition hover:bg-muted hover:text-foreground"
      >
        <ExternalLink className="size-[1.1rem]" />
        Открыть сайт
      </a>
      <form action={logout}>
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-[0.9rem] px-3 py-2.5 text-left text-[0.95rem] text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <LogOut className="size-[1.1rem]" />
          Выйти
          <span className="ml-auto truncate text-xs">{login}</span>
        </button>
      </form>
    </div>
  );
}

export function AdminShell({
  login,
  siteName,
  children,
}: {
  login: string;
  siteName: string;
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setMenuOpen(false), [pathname]);

  const brand = (
    <Link href="/admin" className="block">
      <span className="block font-display text-xl font-medium leading-tight">
        {siteName}
      </span>
      <span className="text-xs tracking-[0.14em] uppercase text-accent">
        Админ-панель
      </span>
    </Link>
  );

  return (
    <div className="min-h-screen bg-warm/60 dark:bg-background lg:grid lg:grid-cols-[16rem_1fr]">
      {/* Десктоп: боковая панель */}
      <aside className="sticky top-0 hidden h-screen flex-col gap-8 border-r border-border bg-card px-4 py-6 lg:flex">
        <div className="flex items-start justify-between gap-2 px-3">
          {brand}
          <ThemeToggle className="size-9 shrink-0" />
        </div>
        <div className="flex-1 overflow-y-auto">
          <Nav />
        </div>
        <SidebarFooter login={login} />
      </aside>

      {/* Мобильная версия: верхняя панель и выезжающее меню */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card px-4 py-3 lg:hidden">
        {brand}
        <div className="flex items-center gap-2">
          <ThemeToggle className="size-9" />
          <button
            type="button"
            aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="inline-flex size-9 items-center justify-center rounded-full border border-border"
          >
            {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </header>
      {menuOpen ? (
        <div className="fixed inset-x-0 top-[61px] bottom-0 z-20 flex flex-col gap-6 overflow-y-auto bg-card px-4 py-6 lg:hidden">
          <Nav onNavigate={() => setMenuOpen(false)} />
          <SidebarFooter login={login} />
        </div>
      ) : null}

      <main className="min-w-0 px-4 py-6 md:px-8 md:py-10">{children}</main>
    </div>
  );
}
