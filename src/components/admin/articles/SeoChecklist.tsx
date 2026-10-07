"use client";

import { useMemo } from "react";
import Link from "next/link";
import { CircleAlert, CircleCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { runSeoChecks } from "@/lib/content/seo-checks";
import type { ArticleInput } from "@/lib/validation/article";
import { cardClass } from "@/components/admin/ui";

/** Короткий чек-лист перед публикацией — по справке «Как писать для SEO» */
export function SeoChecklist({
  input,
  coverAlt,
}: {
  input: ArticleInput;
  coverAlt: string | null;
}) {
  const checks = useMemo(
    () => runSeoChecks(input, { coverAlt }),
    [input, coverAlt],
  );
  const passed = checks.filter((c) => c.ok).length;

  return (
    <section className={`${cardClass} space-y-3`}>
      <div className="flex items-center justify-between">
        <h2 className="font-medium">Чек-лист SEO</h2>
        <span
          className={cn(
            "text-sm tabular-nums",
            passed === checks.length ? "text-accent" : "text-muted-foreground",
          )}
        >
          {passed} из {checks.length}
        </span>
      </div>
      <ul className="space-y-1.5 text-sm">
        {checks.map((check) => (
          <li key={check.id} className="flex items-start gap-2">
            {check.ok ? (
              <CircleCheck className="mt-0.5 size-4 shrink-0 text-accent" />
            ) : (
              <CircleAlert className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
            )}
            <span className={check.ok ? "text-muted-foreground" : undefined}>
              {check.label}
            </span>
          </li>
        ))}
      </ul>
      <Link
        href="/admin/seo-guide"
        target="_blank"
        className="inline-block text-sm text-accent hover:underline"
      >
        Как писать для SEO →
      </Link>
    </section>
  );
}
