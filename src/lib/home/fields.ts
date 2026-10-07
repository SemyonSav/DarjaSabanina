import type { BlockKey } from "./schema";

/**
 * Описание полей блоков для формы в админке. Проверка данных — по zod-схемам
 * из schema.ts; имена полей здесь совпадают с ними.
 */

interface BaseField {
  name: string;
  label: string;
  hint?: string;
}

export type FieldDef =
  | (BaseField & { type: "text"; placeholder?: string })
  | (BaseField & { type: "textarea"; rows?: number })
  /** Текст с оформлением: абзацы, жирный, курсив, ссылки */
  | (BaseField & { type: "richtext"; rows?: number })
  | (BaseField & { type: "link"; placeholder?: string })
  | (BaseField & { type: "image" })
  | (BaseField & { type: "icon" })
  | (BaseField & { type: "group"; fields: FieldDef[] })
  | (BaseField & {
      type: "list";
      itemLabel: string;
      /** Поле, значение которого показывается в заголовке карточки */
      titleField: string;
      fields: FieldDef[];
      newItem: Record<string, unknown>;
      max?: number;
    });

export interface BlockDefinition {
  title: string;
  description: string;
  fields: FieldDef[];
}

const PARAGRAPHS_HINT =
  "Enter — новый абзац, Shift+Enter — перенос строки. Выделите слова, чтобы сделать их жирными, курсивом или ссылкой.";

const heading = (hint?: string): FieldDef => ({
  type: "group",
  name: "heading",
  label: "Заголовок блока",
  hint,
  fields: [
    {
      type: "text",
      name: "eyebrow",
      label: "Надпись над заголовком",
      hint: "Короткая подпись зелёными буквами. Можно оставить пустой.",
    },
    { type: "text", name: "title", label: "Заголовок (H2)" },
    { type: "richtext", name: "description", label: "Описание", rows: 2 },
  ],
});

const cards = (itemLabel: string, max = 24): FieldDef => ({
  type: "list",
  name: "items",
  label: "Карточки",
  itemLabel,
  titleField: "title",
  max,
  newItem: { title: "", description: "", icon: "Sparkles" },
  fields: [
    { type: "text", name: "title", label: "Заголовок" },
    { type: "richtext", name: "description", label: "Текст", rows: 3 },
    { type: "icon", name: "icon", label: "Иконка" },
  ],
});

export const blockDefinitions: Record<BlockKey, BlockDefinition> = {
  general: {
    title: "Общие настройки",
    description:
      "Имя, специализация и описание сайта — в шапке, подвале, заголовках вкладок и в поиске.",
    fields: [
      { type: "text", name: "name", label: "Имя" },
      {
        type: "text",
        name: "jobTitle",
        label: "Специализация",
        hint: "Например: «Психолог • Психосоматолог • Расстановщик».",
      },
      {
        type: "textarea",
        name: "description",
        label: "Описание сайта",
        rows: 3,
        hint: "Используется в поиске и соцсетях, если для страницы нет своего описания. 120–160 символов.",
      },
      {
        type: "text",
        name: "seoTitle",
        label: "SEO-заголовок главной (title)",
        hint: "Если пусто — «Имя — Специализация». 50–60 символов.",
      },
      {
        type: "textarea",
        name: "seoDescription",
        label: "SEO-описание главной",
        rows: 3,
        hint: "Если пусто — описание сайта. 120–160 символов.",
      },
      {
        type: "richtext",
        name: "footerText",
        label: "Текст в подвале",
        rows: 2,
        hint: "Выводится после специализации.",
      },
      {
        type: "image",
        name: "ogImageId",
        label: "Картинка для соцсетей",
        hint: "Показывается при отправке ссылки на сайт в мессенджерах. Лучше 1200×630. Если не выбрана — фото с первого экрана.",
      },
    ],
  },
  contacts: {
    title: "Контакты",
    description:
      "Используются в блоке контактов, шапке, подвале, кнопке записи и микроразметке. Пустые контакты не показываются.",
    fields: [
      {
        type: "text",
        name: "phone",
        label: "Телефон",
        placeholder: "+7 (900) 123-45-67",
      },
      { type: "text", name: "email", label: "Email" },
      {
        type: "link",
        name: "telegram",
        label: "Telegram (личный)",
        placeholder: "https://t.me/username",
      },
      {
        type: "link",
        name: "telegramChannel",
        label: "Telegram-канал",
        placeholder: "https://t.me/channel",
      },
      {
        type: "link",
        name: "whatsapp",
        label: "WhatsApp",
        placeholder: "https://wa.me/79001234567",
      },
    ],
  },
  hero: {
    title: "Первый экран",
    description: "Имя, текст и фото в самом верху главной.",
    fields: [
      { type: "text", name: "eyebrow", label: "Надпись над заголовком" },
      {
        type: "text",
        name: "title",
        label: "Заголовок (H1)",
        hint: "Главный заголовок страницы. Обычно — имя.",
      },
      {
        type: "richtext",
        name: "text",
        label: "Текст",
        rows: 7,
        hint: PARAGRAPHS_HINT,
      },
      { type: "text", name: "primaryLabel", label: "Кнопка записи" },
      {
        type: "text",
        name: "secondaryLabel",
        label: "Кнопка «Статьи»",
        hint: "Пусто — кнопка скрыта.",
      },
      { type: "text", name: "note", label: "Подпись под кнопками" },
      {
        type: "image",
        name: "photoId",
        label: "Фото",
        hint: "Вертикальное, от 1000 px по ширине. Если не выбрано — текущее фото сайта.",
      },
      {
        type: "text",
        name: "photoAlt",
        label: "Описание фото (alt)",
        hint: "Например: «Дарья Сабанина — психолог».",
      },
    ],
  },
  requests: {
    title: "Запросы",
    description: "Карточки с темами, с которыми можно прийти.",
    fields: [heading(), cards("Запрос")],
  },
  method: {
    title: "Метод",
    description:
      "Рассказ о системных расстановках и полевой терапии и зелёная карточка со слоганом.",
    fields: [
      {
        type: "group",
        name: "heading",
        label: "Заголовок блока",
        fields: [
          { type: "text", name: "eyebrow", label: "Надпись над заголовком" },
          { type: "text", name: "title", label: "Заголовок (H2)" },
        ],
      },
      {
        type: "richtext",
        name: "intro",
        label: "Вступление",
        rows: 2,
        hint: "Выделяется крупным шрифтом.",
      },
      {
        type: "list",
        name: "sections",
        label: "Разделы",
        itemLabel: "Раздел",
        titleField: "heading",
        max: 10,
        newItem: { heading: "", text: "" },
        fields: [
          { type: "text", name: "heading", label: "Подзаголовок (H3)" },
          {
            type: "richtext",
            name: "text",
            label: "Текст",
            rows: 6,
            hint: PARAGRAPHS_HINT,
          },
        ],
      },
      {
        type: "text",
        name: "moreLabel",
        label: "Кнопка «Подробнее»",
        hint: "Пусто — кнопка скрыта.",
      },
      {
        type: "link",
        name: "moreHref",
        label: "Куда ведёт «Подробнее»",
        placeholder: "/articles/…",
        hint: "Адрес статьи на сайте (начинается с /) или полный адрес.",
      },
      {
        type: "textarea",
        name: "slogan",
        label: "Слоган в зелёной карточке",
        rows: 2,
      },
      {
        type: "richtext",
        name: "sloganNote",
        label: "Текст под слоганом",
        rows: 2,
      },
      {
        type: "text",
        name: "ctaLabel",
        label: "Кнопка записи в карточке",
        hint: "Пусто — кнопка скрыта.",
      },
    ],
  },
  blog: {
    title: "Статьи",
    description:
      "Три статьи, отмеченные «Показывать на главной» (или самые свежие).",
    fields: [
      heading(),
      {
        type: "text",
        name: "buttonLabel",
        label: "Кнопка «Все статьи»",
        hint: "Пусто — кнопка скрыта.",
      },
    ],
  },
  advantages: {
    title: "Почему меня выбирают",
    description: "Карточки с преимуществами.",
    fields: [heading(), cards("Преимущество")],
  },
  testimonials: {
    title: "Отзывы",
    description: "Заголовок блока. Сами отзывы — в разделе «Отзывы».",
    fields: [heading()],
  },
  faq: {
    title: "Частые вопросы",
    description:
      "Вопросы и ответы — они же попадают в микроразметку FAQ для поисковиков.",
    fields: [
      heading(),
      {
        type: "text",
        name: "buttonLabel",
        label: "Кнопка «Задать вопрос»",
        hint: "Пусто — кнопка скрыта.",
      },
      {
        type: "list",
        name: "items",
        label: "Вопросы",
        itemLabel: "Вопрос",
        titleField: "question",
        max: 40,
        newItem: { question: "", answer: "" },
        fields: [
          { type: "text", name: "question", label: "Вопрос" },
          {
            type: "richtext",
            name: "answer",
            label: "Ответ",
            rows: 5,
            hint: PARAGRAPHS_HINT,
          },
        ],
      },
    ],
  },
  contact: {
    title: "Контакты",
    description: "Заголовок и подзаголовок блока контактов.",
    fields: [heading()],
  },
};
