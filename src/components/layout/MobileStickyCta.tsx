"use client";

import Link from "next/link";

export function MobileStickyCta({ phone }: { phone: string }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 backdrop-blur-xl md:hidden">
      <Link
        href="/#contact"
        className="flex h-12 items-center justify-center rounded-[1.2rem] bg-accent text-accent-foreground"
      >
        Записаться{phone ? ` · ${phone}` : ""}
      </Link>
    </div>
  );
}
