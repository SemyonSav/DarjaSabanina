// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { cleanPastedHtml } from "@/lib/content/paste";

describe("cleanPastedHtml", () => {
  it("чистит вставку из Google Docs", () => {
    const html = cleanPastedHtml(
      `<b style="font-weight:normal;" id="docs-internal-guid-1">` +
        `<h1>Заголовок</h1>` +
        `<p>Текст <a href="https://www.google.com/url?q=https://who.int/news&amp;sa=D"><span style="text-decoration:underline">ссылка</span></a></p>` +
        `<br><p>&nbsp;</p>` +
        `<p><img src="https://lh7.googleusercontent.com/x.png"></p>` +
        `<h6>Мелкий</h6></b>`,
    );
    expect(html).not.toContain("docs-internal-guid");
    expect(html).toContain("<h2>Заголовок</h2>");
    expect(html).toContain('href="https://who.int/news"');
    expect(html).not.toContain("underline");
    expect(html).not.toContain("<img");
    expect(html).not.toMatch(/<p>\s*(&nbsp;| )?\s*<\/p>/);
    expect(html).toContain("<h4>Мелкий</h4>");
  });

  it("убирает служебное из Word", () => {
    const html = cleanPastedHtml(
      `<style>p{}</style><!--[if gte mso 9]><xml></xml><![endif]-->` +
        `<p class="MsoNormal">Из Word<o:p></o:p></p>`,
    );
    expect(html).not.toContain("<style");
    expect(html).not.toContain("<!--");
    expect(html).toContain("Из Word");
  });

  it("оставляет свои картинки", () => {
    expect(
      cleanPastedHtml('<p><img src="/uploads/2026/10/a.webp"></p>'),
    ).toContain('<img src="/uploads/2026/10/a.webp">');
  });
});
