/**
 * Очистка HTML, вставленного из Word, Google Docs и с сайтов.
 * Стили, классы и неизвестные теги ProseMirror отбросит сам по схеме;
 * здесь — то, что схема не исправит.
 */

const JUNK_SELECTOR = "style, script, meta, link, title, xml, o\\:p, w\\:sdt";

function unwrap(element: Element) {
  element.replaceWith(...Array.from(element.childNodes));
}

function renameTag(element: Element, tagName: string) {
  const replacement = element.ownerDocument.createElement(tagName);
  replacement.append(...Array.from(element.childNodes));
  element.replaceWith(replacement);
}

/** https://www.google.com/url?q=https://site.ru&sa=D → https://site.ru */
function unwrapRedirect(href: string): string {
  try {
    const url = new URL(href);
    if (
      /(^|\.)google\.[a-z.]+$/.test(url.hostname) &&
      url.pathname === "/url"
    ) {
      return url.searchParams.get("q") ?? href;
    }
  } catch {
    // относительная или некорректная ссылка — оставляем как есть
  }
  return href;
}

function isEmptyBlock(element: Element): boolean {
  return (
    !element.querySelector("img") &&
    (element.textContent ?? "").replace(/ /g, " ").trim() === ""
  );
}

export function cleanPastedHtml(html: string): string {
  if (typeof DOMParser === "undefined") return html;
  const doc = new DOMParser().parseFromString(html, "text/html");
  const { body } = doc;

  body.querySelectorAll(JUNK_SELECTOR).forEach((el) => el.remove());

  // Комментарии Word (<!--[if gte mso 9]>…)
  const walker = doc.createTreeWalker(body, NodeFilter.SHOW_COMMENT);
  const comments: Node[] = [];
  while (walker.nextNode()) comments.push(walker.currentNode);
  comments.forEach((node) => node.parentNode?.removeChild(node));

  // Google Docs оборачивает всё в <b style="font-weight:normal">
  body
    .querySelectorAll<HTMLElement>(
      "b[id^='docs-internal-guid'], b[style*='font-weight:normal'], b[style*='font-weight: normal']",
    )
    .forEach(unwrap);

  // H1 — заголовок статьи, в тексте только H2–H4
  body.querySelectorAll("h1").forEach((el) => renameTag(el, "h2"));
  body.querySelectorAll("h5, h6").forEach((el) => renameTag(el, "h4"));

  body.querySelectorAll("a[href]").forEach((a) => {
    a.setAttribute("href", unwrapRedirect(a.getAttribute("href") ?? ""));
    // Подчёркивание ссылки — оформление, а не форматирование текста
    a.querySelectorAll("u").forEach(unwrap);
    a.querySelectorAll<HTMLElement>("[style]").forEach((el) => {
      el.style.textDecoration = "";
    });
  });

  // Чужие картинки (хотлинк) не вставляем — только загруженные в медиатеку
  body.querySelectorAll("img").forEach((img) => {
    if (!(img.getAttribute("src") ?? "").startsWith("/uploads/")) img.remove();
  });

  // Пустые абзацы-отступы и одиночные <br> между блоками
  body.querySelectorAll("p, h2, h3, h4, li").forEach((el) => {
    if (isEmptyBlock(el)) el.remove();
  });
  Array.from(body.children)
    .filter((el) => el.tagName === "BR")
    .forEach((el) => el.remove());

  return body.innerHTML;
}
