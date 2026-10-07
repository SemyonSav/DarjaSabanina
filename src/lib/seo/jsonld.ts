import type { Article } from "@/types";
import type { SiteSettings } from "@/lib/home/content";
import { richTextToPlain, type RichDoc } from "@/lib/home/rich-text";
import { siteConfig } from "@/lib/site";
import { articlePath, categoryPath } from "@/lib/paths";
import { articleUrl, shareImage } from "./article";

/**
 * Микроразметка Schema.org (JSON-LD). Сущности связаны через @id,
 * чтобы поисковики понимали: автор статей и владелец сайта — один человек.
 */

const abs = (path: string) =>
  path.startsWith("http") ? path : `${siteConfig.url}${path}`;

export const PERSON_ID = `${siteConfig.url}/#person`;
export const WEBSITE_ID = `${siteConfig.url}/#website`;

/** Телефон, email и профили — только заполненные */
function contactPoints(s: SiteSettings) {
  const { contacts } = s;
  const sameAs = [contacts.telegram, contacts.whatsapp].filter(Boolean);
  return {
    telephone: contacts.phoneHref.replace("tel:", "") || undefined,
    email: contacts.email || undefined,
    sameAs: sameAs.length ? sameAs : undefined,
  };
}

export function personSchema(s: SiteSettings) {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: s.name,
    jobTitle: s.jobTitle,
    description: s.description,
    url: siteConfig.url,
    image: abs(s.photo.url),
    ...contactPoints(s),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Москва",
      addressCountry: "RU",
    },
    knowsAbout: [
      "Психология",
      "Психосоматика",
      "Системные расстановки",
      "Полевая терапия",
    ],
  };
}

export function websiteSchema(s: SiteSettings) {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: siteConfig.url,
    name: s.name,
    description: s.description,
    inLanguage: "ru-RU",
    publisher: { "@id": PERSON_ID },
  };
}

/** Услуги психолога — для главной */
export function professionalServiceSchema(s: SiteSettings) {
  return {
    "@type": "ProfessionalService",
    "@id": `${siteConfig.url}/#service`,
    name: `${s.name} — ${s.jobTitle}`,
    description: s.description,
    url: siteConfig.url,
    image: abs(s.shareImage.url),
    ...contactPoints(s),
    founder: { "@id": PERSON_ID },
    areaServed: { "@type": "Country", name: "Россия" },
    availableLanguage: "ru",
  };
}

export interface Crumb {
  name: string;
  path: string;
}

export function breadcrumbSchema(crumbs: Crumb[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: abs(crumb.path),
    })),
  };
}

export function blogPostingSchema(article: Article, s: SiteSettings) {
  const image = shareImage(article, s);
  const keywords = [article.focusKeyword, ...article.keywords].filter(Boolean);
  return {
    "@type": "BlogPosting",
    "@id": `${articleUrl(article)}#article`,
    headline: article.title,
    description: article.description,
    image: abs(image.url),
    datePublished: article.publishedAt ?? undefined,
    dateModified: article.updatedAt,
    author: { "@id": PERSON_ID },
    publisher: { "@id": PERSON_ID },
    mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl(article) },
    isPartOf: { "@id": WEBSITE_ID },
    inLanguage: "ru-RU",
    articleSection: article.category?.name,
    keywords: keywords.length ? keywords.join(", ") : undefined,
    timeRequired: `PT${article.readingTimeMinutes}M`,
  };
}

export function faqSchema(items: { question: string; answer: RichDoc }[]) {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        // Простой текст: абзацы разделены пустой строкой
        text: richTextToPlain(item.answer).replace(/\n/g, "\n\n"),
      },
    })),
  };
}

/** Несколько сущностей одним блоком */
export function graph(...nodes: object[]) {
  return { "@context": "https://schema.org", "@graph": nodes };
}

const HOME: Crumb = { name: "Главная", path: "/" };
const ARTICLES: Crumb = { name: "Статьи", path: "/articles" };

export function articlesCrumbs(): Crumb[] {
  return [HOME, ARTICLES];
}

export function categoryCrumbs(category: {
  name: string;
  slug: string;
}): Crumb[] {
  return [
    HOME,
    ARTICLES,
    { name: category.name, path: categoryPath(category.slug) },
  ];
}

export function articleCrumbs(article: Article): Crumb[] {
  return [
    HOME,
    ARTICLES,
    ...(article.category
      ? [
          {
            name: article.category.name,
            path: categoryPath(article.category.slug),
          },
        ]
      : []),
    { name: article.title, path: articlePath(article.slug) },
  ];
}
