import { siteConfig } from "@/lib/site";

/** Разрешённые адреса ссылок: http(s), почта, телефон, внутренние пути и якоря */
const SAFE_HREF = /^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i;

export function isSafeHref(href: string): boolean {
  return SAFE_HREF.test(href.trim());
}

/** Ссылка ведёт на этот же сайт */
export function isInternalHref(href: string): boolean {
  const value = href.trim();
  if (value.startsWith("/") || value.startsWith("#")) return true;
  try {
    return new URL(value).host === new URL(siteConfig.url).host;
  } catch {
    return false;
  }
}

/** «example.com/page» → «https://example.com/page» */
export function normalizeHref(input: string): string {
  const value = input.trim();
  if (!value) return "";
  if (isSafeHref(value)) return value;
  if (/^[\w.-]+@[\w-]+\.[\w.]+$/.test(value)) return `mailto:${value}`;
  if (/^[\w-]+(\.[\w-]+)+/.test(value)) return `https://${value}`;
  return value;
}

export interface LinkAttrs {
  href: string;
  target: string | null;
  rel: string | null;
}

/**
 * Атрибуты ссылки: в новой вкладке — с noopener noreferrer,
 * nofollow — для внешних ссылок, которым не стоит передавать вес.
 */
export function buildLinkAttrs(
  href: string,
  options: { newTab: boolean; nofollow: boolean },
): LinkAttrs {
  const rel = [
    ...(options.newTab ? ["noopener", "noreferrer"] : []),
    ...(options.nofollow ? ["nofollow"] : []),
  ];
  return {
    href,
    target: options.newTab ? "_blank" : null,
    rel: rel.length ? rel.join(" ") : null,
  };
}
