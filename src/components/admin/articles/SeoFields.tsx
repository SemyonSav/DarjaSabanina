"use client";

import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site";
import { SEO_LIMITS } from "@/lib/validation/article";

type Limits = { min?: number; max: number };

/** Счётчик символов с подсказкой, попадает ли длина в рекомендацию */
export function CharCounter({
  value,
  limits,
}: {
  value: string;
  limits: Limits;
}) {
  const length = value.trim().length;
  const tooLong = length > limits.max;
  const tooShort =
    limits.min !== undefined && length > 0 && length < limits.min;
  const ok = length > 0 && !tooLong && !tooShort;

  return (
    <span
      className={cn(
        "tabular-nums",
        ok && "text-accent",
        (tooLong || tooShort) && "text-amber-700 dark:text-amber-400",
      )}
    >
      {length}
      {limits.min !== undefined
        ? ` (рекомендуется ${limits.min}–${limits.max})`
        : ` / ${limits.max}`}
    </span>
  );
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

/** Примерный вид статьи в поисковой выдаче */
export function SnippetPreview({
  title,
  slug,
  description,
  siteName,
}: {
  title: string;
  slug: string;
  description: string;
  siteName: string;
}) {
  const host = siteConfig.url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const fullTitle = title ? `${title} · ${siteName}` : siteName;

  return (
    <div className="rounded-[0.9rem] border border-border bg-background p-4">
      <p className="mb-2 text-xs text-muted-foreground">
        Так статья может выглядеть в поиске
      </p>
      <p className="truncate text-sm text-muted-foreground">
        {host} › articles › {slug || "…"}
      </p>
      <p className="mt-1 text-lg leading-snug text-[#1a0dab] dark:text-[#8ab4f8]">
        {truncate(fullTitle, SEO_LIMITS.title.max + 10)}
      </p>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
        {description
          ? truncate(description, SEO_LIMITS.description.max)
          : "Добавьте SEO-описание или анонс — иначе поисковик сам выберет кусок текста."}
      </p>
    </div>
  );
}
