import fs from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import { Marked } from "marked";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Справка по SEO" };

// Справка лежит в репозитории: src/content/seo-guide.md
const GUIDE_PATH = path.join(process.cwd(), "src/content/seo-guide.md");

const marked = new Marked({
  gfm: true,
  renderer: {
    // Внешние ссылки — в новой вкладке, чтобы не уходить из админки
    link({ href, tokens }) {
      const text = this.parser.parseInline(tokens);
      const external = /^https?:\/\//.test(href);
      return external
        ? `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`
        : `<a href="${href}">${text}</a>`;
    },
  },
});

export default async function SeoGuidePage() {
  await requireAdmin();
  // Текст из репозитория, а не от пользователей, — санитайзинг не нужен
  const html = await marked.parse(await fs.readFile(GUIDE_PATH, "utf8"));

  return (
    <div className="mx-auto max-w-3xl rounded-[1.25rem] border border-border bg-card px-5 py-8 shadow-soft md:px-10 md:py-10">
      <div
        className="prose-article seo-guide"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
