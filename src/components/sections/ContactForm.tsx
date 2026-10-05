"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function ContactForm({ className }: { className?: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    // Заглушка: подключите API / Telegram-бота / CRM
    await new Promise((r) => setTimeout(r, 800));
    setStatus("success");
    (e.target as HTMLFormElement).reset();
  }

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        "space-y-4 rounded-[1.5rem] border border-border bg-card p-6 shadow-soft md:p-8",
        className,
      )}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm text-muted-foreground">Имя</span>
          <input
            required
            name="name"
            autoComplete="name"
            className="h-12 w-full rounded-[1.1rem] border border-border bg-background px-4 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
            placeholder="Как к вам обращаться"
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm text-muted-foreground">Телефон</span>
          <input
            required
            name="phone"
            type="tel"
            autoComplete="tel"
            className="h-12 w-full rounded-[1.1rem] border border-border bg-background px-4 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
            placeholder="+7 ..."
          />
        </label>
      </div>

      <label className="block space-y-2">
        <span className="text-sm text-muted-foreground">Email (необязательно)</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          className="h-12 w-full rounded-[1.1rem] border border-border bg-background px-4 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
          placeholder="you@email.com"
        />
      </label>

      <fieldset className="space-y-2">
        <legend className="text-sm text-muted-foreground">Формат</legend>
        <div className="flex flex-wrap gap-3">
          <label className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 has-[:checked]:border-accent has-[:checked]:bg-accent-soft">
            <input
              type="radio"
              name="format"
              value="online"
              defaultChecked
              className="accent-[var(--accent)]"
            />
            Онлайн
          </label>
          <label className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 has-[:checked]:border-accent has-[:checked]:bg-accent-soft">
            <input
              type="radio"
              name="format"
              value="offline"
              className="accent-[var(--accent)]"
            />
            Очно
          </label>
        </div>
      </fieldset>

      <label className="block space-y-2">
        <span className="text-sm text-muted-foreground">Сообщение</span>
        <textarea
          name="message"
          rows={4}
          className="w-full resize-y rounded-[1.1rem] border border-border bg-background px-4 py-3 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
          placeholder="Кратко опишите запрос — по желанию"
        />
      </label>

      <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={status === "loading"}>
        {status === "loading" ? "Отправляем..." : "Отправить заявку"}
      </Button>

      {status === "success" ? (
        <p className="text-sm text-accent" role="status">
          Спасибо! Я свяжусь с вами в ближайшее время.
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Нажимая кнопку, вы соглашаетесь с{" "}
          <a href="/privacy" className="underline underline-offset-2">
            политикой конфиденциальности
          </a>
          .
        </p>
      )}
    </form>
  );
}
