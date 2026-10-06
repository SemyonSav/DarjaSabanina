"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  GripVertical,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { HomeLayout, HomeSectionKey } from "@/lib/home/schema";
import { saveLayoutAction } from "@/app/admin/(panel)/home/actions";

type Section = HomeLayout["sections"][number];

const iconButton =
  "inline-flex size-9 items-center justify-center rounded-[0.6rem] text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-30";

/** Порядок, видимость и пункты меню секций главной; сохраняется сразу */
export function SectionList({
  layout,
  titles,
  customized,
}: {
  layout: HomeLayout;
  titles: Record<HomeSectionKey, string>;
  customized: Record<HomeSectionKey, boolean>;
}) {
  const [sections, setSections] = useState(layout.sections);
  const [dragKey, setDragKey] = useState<HomeSectionKey | null>(null);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => setSections(layout.sections), [layout]);

  function persist(next: Section[]) {
    setSections(next);
    startTransition(async () => {
      const result = await saveLayoutAction({ sections: next });
      setError(result.ok ? "" : result.message);
      router.refresh();
    });
  }

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    [next[index], next[target]] = [next[target], next[index]];
    persist(next);
  }

  function dropOn(targetKey: HomeSectionKey) {
    if (!dragKey || dragKey === targetKey) return;
    const dragged = sections.find((s) => s.key === dragKey)!;
    const next = sections.filter((s) => s.key !== dragKey);
    next.splice(
      next.findIndex((s) => s.key === targetKey),
      0,
      dragged,
    );
    setDragKey(null);
    persist(next);
  }

  function update(key: HomeSectionKey, patch: Partial<Section>) {
    persist(sections.map((s) => (s.key === key ? { ...s, ...patch } : s)));
  }

  return (
    <div className="space-y-3">
      {error ? (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      ) : null}
      <ul className="space-y-3">
        {sections.map((section, index) => (
          <li
            key={section.key}
            draggable
            onDragStart={() => setDragKey(section.key)}
            onDragEnd={() => setDragKey(null)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => dropOn(section.key)}
            className={cn(
              "flex flex-wrap items-center gap-3 rounded-[1.25rem] border border-border bg-card p-4 shadow-soft transition sm:flex-nowrap",
              dragKey === section.key && "opacity-50",
              !section.visible && "bg-card/60",
            )}
          >
            <GripVertical
              aria-hidden
              className="size-5 shrink-0 cursor-grab text-muted-foreground"
            />
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "font-medium",
                  !section.visible && "text-muted-foreground line-through",
                )}
              >
                {titles[section.key]}
              </p>
              <p className="text-xs text-muted-foreground">
                {section.visible ? "Показывается" : "Скрыт"}
                {customized[section.key] ? " · изменён" : ""}
              </p>
            </div>
            {section.key !== "hero" ? (
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="hidden md:inline">В меню:</span>
                <input
                  defaultValue={section.navLabel}
                  placeholder="не в меню"
                  aria-label={`Пункт меню для блока «${titles[section.key]}»`}
                  onBlur={(e) => {
                    const navLabel = e.target.value.trim();
                    if (navLabel !== section.navLabel) {
                      update(section.key, { navLabel });
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.currentTarget.blur();
                  }}
                  className="h-9 w-32 rounded-[0.6rem] border border-border bg-background px-2.5 text-sm text-foreground outline-none focus:border-accent"
                />
              </label>
            ) : null}
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                aria-label="Выше"
                disabled={pending || index === 0}
                onClick={() => move(index, -1)}
                className={iconButton}
              >
                <ArrowUp className="size-4" />
              </button>
              <button
                type="button"
                aria-label="Ниже"
                disabled={pending || index === sections.length - 1}
                onClick={() => move(index, 1)}
                className={iconButton}
              >
                <ArrowDown className="size-4" />
              </button>
              <button
                type="button"
                aria-label={section.visible ? "Скрыть блок" : "Показать блок"}
                title={section.visible ? "Скрыть блок" : "Показать блок"}
                disabled={pending}
                onClick={() =>
                  update(section.key, { visible: !section.visible })
                }
                className={iconButton}
              >
                {section.visible ? (
                  <Eye className="size-4" />
                ) : (
                  <EyeOff className="size-4" />
                )}
              </button>
              <Link
                href={`/admin/home/${section.key}`}
                className="ml-1 inline-flex h-9 items-center gap-1.5 rounded-[0.7rem] border border-border px-3 text-sm transition hover:border-accent hover:text-accent"
              >
                <Pencil className="size-3.5" />
                Изменить
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
