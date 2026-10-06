import type { JSONContent } from "@tiptap/core";
import { slugify } from "@/lib/slug";
import { countWords, documentToText } from "./text";
import { SEO_LIMITS, type ArticleInput } from "@/lib/validation/article";

export interface SeoCheck {
  id: string;
  label: string;
  ok: boolean;
}

/**
 * Грубая основа слова, чтобы «тревога» находилась в «тревоги», «тревогой»:
 * отбрасываем окончание, оставляя не меньше 4 букв.
 */
function stems(phrase: string): string[] {
  return phrase
    .toLocaleLowerCase("ru")
    .split(/[^\p{L}\p{N}]+/u)
    .filter((word) => word.length > 2)
    .map((word) => word.slice(0, Math.max(4, word.length - 2)));
}

export function containsPhrase(text: string, phrase: string): boolean {
  const parts = stems(phrase);
  if (!parts.length) return false;
  const haystack = text.toLocaleLowerCase("ru");
  return parts.every((stem) => haystack.includes(stem));
}

function slugContainsPhrase(slug: string, phrase: string): boolean {
  const parts = stems(phrase).map((stem) => slugify(stem));
  return parts.length > 0 && parts.every((part) => part && slug.includes(part));
}

function walk(node: JSONContent, visit: (node: JSONContent) => void) {
  visit(node);
  node.content?.forEach((child) => walk(child, visit));
}

function firstParagraphText(doc: JSONContent): string {
  const first = doc.content?.find((node) => node.type === "paragraph");
  return first ? documentToText(first) : "";
}

/** Проверки из справки по SEO — подсказка, а не запрет публикации */
export function runSeoChecks(
  input: ArticleInput,
  options: { coverAlt: string | null },
): SeoCheck[] {
  const phrase = input.focusKeyword.trim();
  const title = input.seoTitle || input.title;
  const description = input.seoDescription || input.excerpt;
  const words = countWords(documentToText(input.content));

  let hasH2 = false;
  let internalLinks = 0;
  let images = 0;
  let imagesWithoutAlt = 0;
  walk(input.content, (node) => {
    if (node.type === "heading" && node.attrs?.level === 2) hasH2 = true;
    if (node.type === "image") {
      images++;
      if (!String(node.attrs?.alt ?? "").trim()) imagesWithoutAlt++;
    }
    for (const mark of node.marks ?? []) {
      const href = String(mark.attrs?.href ?? "");
      if (mark.type === "link" && href.startsWith("/articles/"))
        internalLinks++;
    }
  });

  const checks: SeoCheck[] = [
    { id: "phrase", label: "Указана ключевая фраза", ok: Boolean(phrase) },
  ];
  if (phrase) {
    checks.push(
      {
        id: "phrase-title",
        label: "Фраза в заголовке",
        ok: containsPhrase(title, phrase),
      },
      {
        id: "phrase-intro",
        label: "Фраза в первом абзаце",
        ok: containsPhrase(firstParagraphText(input.content), phrase),
      },
      {
        id: "phrase-slug",
        label: "Фраза в адресе",
        ok: slugContainsPhrase(input.slug, phrase),
      },
      {
        id: "phrase-description",
        label: "Фраза в описании",
        ok: containsPhrase(description, phrase),
      },
    );
  }
  const titleLength = title.trim().length;
  const descriptionLength = description.trim().length;
  checks.push(
    {
      id: "title-length",
      label: `SEO-заголовок ${SEO_LIMITS.title.min}–${SEO_LIMITS.title.max} символов`,
      ok:
        titleLength >= SEO_LIMITS.title.min &&
        titleLength <= SEO_LIMITS.title.max,
    },
    {
      id: "description-length",
      label: `Описание ${SEO_LIMITS.description.min}–${SEO_LIMITS.description.max} символов`,
      ok:
        descriptionLength >= SEO_LIMITS.description.min &&
        descriptionLength <= SEO_LIMITS.description.max,
    },
    {
      id: "length",
      label: `Текст от 400 слов (сейчас ${words})`,
      ok: words >= 400,
    },
    { id: "h2", label: "Есть подзаголовки H2", ok: hasH2 },
    {
      id: "internal-links",
      label: "Есть ссылки на свои статьи",
      ok: internalLinks > 0,
    },
    {
      id: "cover",
      label: "Обложка с описанием (alt)",
      ok: Boolean(input.coverImageId && options.coverAlt?.trim()),
    },
    {
      id: "images-alt",
      label: "У картинок в тексте есть alt",
      ok: images === 0 || imagesWithoutAlt === 0,
    },
    { id: "category", label: "Выбрана рубрика", ok: Boolean(input.categoryId) },
    {
      id: "excerpt",
      label: "Заполнен анонс",
      ok: Boolean(input.excerpt.trim()),
    },
  );
  return checks;
}
