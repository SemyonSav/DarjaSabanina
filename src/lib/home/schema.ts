import { z } from "zod";
import { richText } from "./rich-text";

/**
 * Содержимое главной страницы и общие настройки сайта, которые
 * редактируются в админке. Схемы — источник типов и проверка данных
 * и при сохранении, и при чтении из БД.
 */

const line = (max = 200) =>
  z.string().trim().max(max, `Не длиннее ${max} символов`);
const required = (max = 200) => line(max).min(1, "Заполните поле");
const mediaId = z.number().int().positive().nullable();

/** Иконки, из которых можно выбрать в админке (lucide-react) */
export const ICONS = [
  "HeartPulse",
  "Users",
  "House",
  "Wallet",
  "Compass",
  "Shield",
  "Leaf",
  "Lock",
  "UserRound",
  "Layers",
  "Award",
  "Sparkles",
  "Sun",
  "Moon",
  "Flower2",
  "Baby",
  "Brain",
  "Activity",
  "Smile",
  "Handshake",
  "Infinity",
  "Feather",
  "Star",
  "Gem",
] as const;
export type IconName = (typeof ICONS)[number];

export const sectionHeadingSchema = z.object({
  eyebrow: line(60),
  title: required(160),
  description: richText(400),
});

const cardSchema = z.object({
  title: required(80),
  description: richText(400),
  icon: z.enum(ICONS),
});

/** Ссылка: внутренний путь или полный адрес */
const href = z
  .string()
  .trim()
  .max(300)
  .regex(/^(\/|https?:\/\/|#|$)/, "Адрес должен начинаться с / или https://");

export const blockSchemas = {
  general: z.object({
    name: required(80),
    jobTitle: required(120),
    description: required(300),
    seoTitle: line(120),
    seoDescription: line(300),
    footerText: richText(400),
    ogImageId: mediaId,
  }),
  contacts: z.object({
    phone: line(40),
    email: z.union([z.literal(""), z.email("Некорректный email")]),
    telegram: z.union([
      z.literal(""),
      z.url({ protocol: /^https$/, error: "Ссылка вида https://t.me/…" }),
    ]),
    telegramChannel: z.union([
      z.literal(""),
      z.url({ protocol: /^https$/, error: "Ссылка вида https://t.me/…" }),
    ]),
    whatsapp: z.union([
      z.literal(""),
      z.url({ protocol: /^https$/, error: "Ссылка вида https://wa.me/…" }),
    ]),
  }),
  hero: z.object({
    eyebrow: line(120),
    title: required(80),
    text: richText(2000),
    primaryLabel: required(60),
    secondaryLabel: line(60),
    note: line(120),
    photoId: mediaId,
    photoAlt: line(200),
  }),
  requests: z.object({
    heading: sectionHeadingSchema,
    items: z.array(cardSchema).max(24),
  }),
  method: z.object({
    heading: sectionHeadingSchema.pick({ eyebrow: true, title: true }),
    intro: richText(1000),
    sections: z
      .array(z.object({ heading: line(160), text: richText(5000) }))
      .max(10),
    slogan: line(300),
    sloganNote: richText(400),
    ctaLabel: line(60),
    moreLabel: line(60),
    moreHref: href,
  }),
  blog: z.object({
    heading: sectionHeadingSchema,
    buttonLabel: line(60),
  }),
  advantages: z.object({
    heading: sectionHeadingSchema,
    items: z.array(cardSchema).max(24),
  }),
  testimonials: z.object({ heading: sectionHeadingSchema }),
  faq: z.object({
    heading: sectionHeadingSchema,
    buttonLabel: line(60),
    items: z
      .array(z.object({ question: required(200), answer: richText(5000) }))
      .max(40),
  }),
  contact: z.object({ heading: sectionHeadingSchema }),
};

export type BlockKey = keyof typeof blockSchemas;
/** Данные блока после проверки (форматированный текст — документ) */
export type BlockData<K extends BlockKey> = z.output<(typeof blockSchemas)[K]>;
/** Данные блока на входе (форматированный текст может быть строкой) */
export type BlockInput<K extends BlockKey> = z.input<(typeof blockSchemas)[K]>;

/** Секции главной в порядке по умолчанию */
export const HOME_SECTIONS = [
  "hero",
  "requests",
  "method",
  "blog",
  "advantages",
  "testimonials",
  "faq",
  "contact",
] as const;
export type HomeSectionKey = (typeof HOME_SECTIONS)[number];

/** Якорь секции на главной — для меню и ссылок «/#…» */
export const SECTION_ANCHORS: Record<HomeSectionKey, string> = {
  hero: "top",
  requests: "requests",
  method: "constellations",
  blog: "blog",
  advantages: "why",
  testimonials: "reviews",
  faq: "faq",
  contact: "contact",
};

export const layoutSchema = z.object({
  sections: z
    .array(
      z.object({
        key: z.enum(HOME_SECTIONS),
        visible: z.boolean(),
        /** Пункт меню; пусто — секции нет в меню */
        navLabel: line(30),
      }),
    )
    .refine(
      (list) => new Set(list.map((s) => s.key)).size === list.length,
      "Секции не должны повторяться",
    ),
});
export type HomeLayout = z.infer<typeof layoutSchema>;
