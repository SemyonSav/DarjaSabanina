/**
 * Технические настройки сайта. Тексты, имя и контакты редактируются
 * в админке: см. src/lib/home (значения по умолчанию — defaults.ts).
 */
export const siteConfig = {
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://example.com",
  locale: "ru_RU",
  /** Фото специалиста, пока в админке не выбрано другое */
  defaultPhoto: "/avatar.jpg",
} as const;
