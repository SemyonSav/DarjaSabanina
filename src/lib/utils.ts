import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string, locale = "ru-RU") {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Moscow",
  }).format(new Date(date));
}

export function absoluteUrl(path = "") {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://example.com";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
