import { describe, expect, it } from "vitest";
import { isValidSlug, slugify, SLUG_MAX_LENGTH } from "@/lib/slug";

describe("slugify", () => {
  it("транслитерирует кириллицу", () => {
    expect(slugify("Что такое системные расстановки?")).toBe(
      "chto-takoe-sistemnye-rasstanovki",
    );
    expect(slugify("Ёжик в тумане: щука и подъезд")).toBe(
      "ezhik-v-tumane-shchuka-i-podezd",
    );
  });

  it("убирает лишние символы и дефисы по краям", () => {
    expect(slugify("  «Тревога» — 5 шагов!  ")).toBe("trevoga-5-shagov");
    expect(slugify("Hello, World")).toBe("hello-world");
    expect(slugify("!!!")).toBe("");
  });

  it("обрезает длинный адрес по границе слова", () => {
    const slug = slugify("очень длинный заголовок статьи ".repeat(10));
    expect(slug.length).toBeLessThanOrEqual(SLUG_MAX_LENGTH);
    expect(slug.endsWith("-")).toBe(false);
    expect(isValidSlug(slug)).toBe(true);
  });
});

describe("isValidSlug", () => {
  it.each([
    ["trevoga-kak-signal", true],
    ["a1-b2", true],
    ["Trevoga", false],
    ["trevoga--signal", false],
    ["-trevoga", false],
    ["тревога", false],
    ["", false],
  ])("%s → %s", (slug, valid) => {
    expect(isValidSlug(slug)).toBe(valid);
  });
});
