"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MediaImage } from "@/types";
import type { ArticleInput } from "@/lib/validation/article";
import { autosaveArticle } from "@/app/admin/(panel)/articles/actions";

/** Снимок формы для восстановления */
export interface DraftSnapshot {
  values: ArticleInput;
  cover: MediaImage | null;
  ogImage: MediaImage | null;
  savedAt: string;
}

export type AutosaveStatus =
  | { kind: "idle" }
  | { kind: "pending" }
  | { kind: "saving" }
  | { kind: "saved"; at: string }
  | { kind: "error" };

/** Черновик ещё не созданной статьи живёт в браузере */
export const NEW_DRAFT_KEY = "article-draft-new";

const DELAY_MS = 3000;

/** Сравнимый снимок значений: не зависит от порядка полей */
export function snapshotOf(values: ArticleInput): string {
  return JSON.stringify(
    Object.fromEntries(
      Object.entries(values).sort(([a], [b]) => a.localeCompare(b)),
    ),
  );
}

export function readLocalDraft(): DraftSnapshot | null {
  try {
    const raw = localStorage.getItem(NEW_DRAFT_KEY);
    return raw ? (JSON.parse(raw) as DraftSnapshot) : null;
  } catch {
    return null;
  }
}

export function clearLocalDraft(): void {
  try {
    localStorage.removeItem(NEW_DRAFT_KEY);
  } catch {}
}

/**
 * Сохраняет правки через DELAY_MS после последнего изменения:
 * у существующей статьи — на сервер (не трогая опубликованную версию),
 * у новой — в localStorage. Предупреждает при уходе с несохранёнными правками.
 */
export function useAutosave({
  articleId,
  draft,
  baseline,
  enabled,
}: {
  articleId?: number;
  draft: Omit<DraftSnapshot, "savedAt">;
  /** snapshotOf() явно сохранённых значений — с ним сравниваем, есть ли правки */
  baseline: string;
  enabled: boolean;
}) {
  const [status, setStatus] = useState<AutosaveStatus>({ kind: "idle" });
  const json = snapshotOf(draft.values);
  const dirty = json !== baseline;

  const lastSaved = useRef<string>(baseline);
  const latest = useRef({ draft, json });
  latest.current = { draft, json };

  const persist = useCallback(async () => {
    const { draft: current, json: currentJson } = latest.current;
    if (currentJson === lastSaved.current) return;
    setStatus({ kind: "saving" });

    if (articleId) {
      const result = await autosaveArticle(articleId, current.values).catch(
        () => ({ ok: false as const, savedAt: undefined }),
      );
      if (result.ok && result.savedAt) {
        lastSaved.current = currentJson;
        setStatus({ kind: "saved", at: result.savedAt });
      } else {
        setStatus({ kind: "error" });
      }
      return;
    }

    try {
      const savedAt = new Date().toISOString();
      localStorage.setItem(
        NEW_DRAFT_KEY,
        JSON.stringify({ ...current, savedAt } satisfies DraftSnapshot),
      );
      lastSaved.current = currentJson;
      setStatus({ kind: "saved", at: savedAt });
    } catch {
      setStatus({ kind: "error" });
    }
  }, [articleId]);

  useEffect(() => {
    if (!enabled || !dirty || json === lastSaved.current) {
      if (!dirty) setStatus({ kind: "idle" });
      return;
    }
    setStatus({ kind: "pending" });
    const timer = window.setTimeout(() => void persist(), DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [json, dirty, enabled, persist]);

  // Несохранённые правки — предупреждаем перед закрытием вкладки
  useEffect(() => {
    function onBeforeUnload(event: BeforeUnloadEvent) {
      if (latest.current.json !== lastSaved.current && dirty) {
        event.preventDefault();
      }
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  /** Сохранить немедленно (например, перед предпросмотром) */
  const flush = useCallback(async () => {
    if (latest.current.json !== lastSaved.current) await persist();
  }, [persist]);

  /** После явного сохранения правок больше нет */
  const markSaved = useCallback((savedJson: string) => {
    lastSaved.current = savedJson;
    setStatus({ kind: "idle" });
  }, []);

  return { status, dirty, flush, markSaved };
}
