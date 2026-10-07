const translitMap: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh",
  з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
  п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts",
  ч: "ch", ш: "sh", щ: "shch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu",
  я: "ya",
};

export const SLUG_MAX_LENGTH = 80;

/** Латинский slug для URL: «Что такое расстановки?» → `chto-takoe-rasstanovki` */
export function slugify(input: string): string {
  const latin = Array.from(input.toLowerCase())
    .map((char) => translitMap[char] ?? char)
    .join("");

  const slug = latin
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (slug.length <= SLUG_MAX_LENGTH) return slug;
  // Обрезаем по границе слова, чтобы не оставлять обрубков
  const cut = slug.slice(0, SLUG_MAX_LENGTH);
  return cut.slice(0, cut.lastIndexOf("-")) || cut;
}

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidSlug(slug: string): boolean {
  return slug.length <= SLUG_MAX_LENGTH && SLUG_PATTERN.test(slug);
}
