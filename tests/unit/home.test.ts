import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "psy-home-"));
process.env.DATA_DIR = dataDir;

const { runMigrations } = await import("@/lib/db/migrate");
const { db, sqlite } = await import("@/lib/db");
const { siteBlocks } = await import("@/lib/db/schema");
const repos = await import("@/lib/repos");
const { blockSchemas, layoutSchema, paragraphs } =
  await import("@/lib/home/schema");
const { blockDefaults, layoutDefaults } = await import("@/lib/home/defaults");
const { blockDefinitions } = await import("@/lib/home/fields");
const { getSiteSettings, getHomeSections, phoneHref } =
  await import("@/lib/home/content");

beforeAll(() => runMigrations());
afterAll(() => {
  sqlite.close();
  fs.rmSync(dataDir, { recursive: true, force: true });
});

describe("значения по умолчанию", () => {
  it("проходят проверку схем", () => {
    for (const [key, schema] of Object.entries(blockSchemas)) {
      expect(
        schema.safeParse(blockDefaults[key as keyof typeof blockDefaults])
          .success,
        key,
      ).toBe(true);
    }
    expect(layoutSchema.safeParse(layoutDefaults).success).toBe(true);
  });

  it("у каждого блока есть описание полей с теми же именами", () => {
    for (const [key, definition] of Object.entries(blockDefinitions)) {
      const defaults = blockDefaults[key as keyof typeof blockDefaults];
      for (const field of definition.fields) {
        expect(defaults, `${key}.${field.name}`).toHaveProperty(field.name);
      }
    }
  });
});

describe("mergeWithDefaults", () => {
  it("дополняет вложенные объекты и отбрасывает лишнее", () => {
    const merged = repos.mergeWithDefaults(
      { heading: { title: "A", eyebrow: "B" }, items: [1, 2] },
      { heading: { title: "X" }, items: [3], unknown: true },
    );
    expect(merged).toEqual({
      heading: { title: "X", eyebrow: "B" },
      items: [3],
    });
  });
});

describe("схемы блоков", () => {
  it.each([
    ["hero", { ...blockDefaults.hero, title: "" }],
    ["contacts", { ...blockDefaults.contacts, email: "не-почта" }],
    ["contacts", { ...blockDefaults.contacts, telegram: "http://t.me/x" }],
    ["method", { ...blockDefaults.method, moreHref: "javascript:alert(1)" }],
    [
      "requests",
      {
        ...blockDefaults.requests,
        items: [{ title: "Т", description: "", icon: "НетТакой" }],
      },
    ],
  ] as const)("отклоняет некорректный %s", (key, data) => {
    expect(blockSchemas[key].safeParse(data).success).toBe(false);
  });

  it("не допускает повтор секций", () => {
    const [first] = layoutDefaults.sections;
    expect(layoutSchema.safeParse({ sections: [first, first] }).success).toBe(
      false,
    );
  });
});

describe("утилиты", () => {
  it("делит текст на абзацы по строкам", () => {
    expect(paragraphs("Первый\n\n  Второй \nТретий\n")).toEqual([
      "Первый",
      "Второй",
      "Третий",
    ]);
  });

  it("строит ссылку на телефон", () => {
    expect(phoneHref("+7 (900) 123-45-67")).toBe("tel:+79001234567");
    expect(phoneHref("8 800 555-35-35")).toBe("tel:+88005553535");
    expect(phoneHref("")).toBe("");
  });
});

describe("блоки в БД", () => {
  it("без сохранения — значения по умолчанию", async () => {
    expect(await repos.getBlock("hero")).toEqual(blockDefaults.hero);
    expect(await repos.isBlockCustomized("hero")).toBe(false);
  });

  it("сохраняет, сбрасывает и не ломается на испорченных данных", async () => {
    await repos.saveBlock("hero", { ...blockDefaults.hero, title: "Новое" });
    expect((await repos.getBlock("hero")).title).toBe("Новое");

    await repos.resetBlock("hero");
    expect((await repos.getBlock("hero")).title).toBe(blockDefaults.hero.title);

    await db
      .insert(siteBlocks)
      .values({ key: "faq", data: { items: "мусор" } });
    expect(await repos.getBlock("faq")).toEqual(blockDefaults.faq);
  });

  it("дописывает секции, которых нет в сохранённом порядке", async () => {
    await repos.saveLayout({
      sections: [{ key: "faq", visible: true, navLabel: "Вопросы" }],
    });
    const layout = await repos.getLayout();
    expect(layout.sections[0].key).toBe("faq");
    expect(layout.sections).toHaveLength(layoutDefaults.sections.length);
  });
});

describe("главная из блоков", () => {
  it("скрытые секции пропадают со страницы и из меню", async () => {
    await repos.saveLayout({
      sections: layoutDefaults.sections.map((s) =>
        s.key === "faq" ? { ...s, visible: false } : s,
      ),
    });
    const sections = await getHomeSections();
    expect(sections.map((s) => s.key)).not.toContain("faq");

    const settings = await getSiteSettings();
    expect(settings.nav.map((n) => n.href)).not.toContain("/#faq");
    expect(settings.nav.map((n) => n.href)).toContain("/#contact");
  });

  it("фото и контакты — из настроек", async () => {
    const settings = await getSiteSettings();
    expect(settings.photo.url).toBe("/avatar.jpg");
    expect(settings.contacts.phoneHref).toBe("tel:+79001234567");
  });
});
