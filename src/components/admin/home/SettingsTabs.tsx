"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/admin/settings", label: "Общие" },
  { href: "/admin/settings/contacts", label: "Контакты" },
];

export function SettingsTabs() {
  const pathname = usePathname();
  return (
    <nav aria-label="Настройки сайта" className="mb-6 flex gap-2">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex h-10 items-center rounded-full border px-4 text-sm transition",
              active
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border hover:border-accent hover:text-accent",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
