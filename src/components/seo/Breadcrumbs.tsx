import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Crumb } from "@/lib/seo/jsonld";

/** Видимые хлебные крошки; те же данные уходят в BreadcrumbList */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav
      aria-label="Хлебные крошки"
      className="mb-8 text-sm text-muted-foreground"
    >
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li
              key={item.path}
              className="inline-flex min-w-0 items-center gap-1.5"
            >
              {last ? (
                <span
                  aria-current="page"
                  className="line-clamp-1 text-foreground"
                >
                  {item.name}
                </span>
              ) : (
                <>
                  <Link
                    href={item.path}
                    className="transition hover:text-accent"
                  >
                    {item.name}
                  </Link>
                  <ChevronRight
                    aria-hidden
                    className="size-3.5 shrink-0 opacity-60"
                  />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
