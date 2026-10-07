import type { JSONContent } from "@tiptap/core";
import { renderToHTMLString } from "@tiptap/static-renderer/pm/html-string";
import { getContentExtensions } from "./extensions";
import { isSafeHref } from "./links";
import { isOwnImageSrc, type FigureImageAttrs } from "./figure-image";
import { siteConfig } from "@/lib/site";

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * HTML тела статьи для RSS и других мест вне React.
 * Ссылки и картинки — абсолютными адресами, небезопасные ссылки убираются.
 */
export function renderContentHtml(doc: JSONContent): string {
  const absolute = (href: string) =>
    href.startsWith("/") ? `${siteConfig.url}${href}` : href;

  return renderToHTMLString({
    content: doc,
    extensions: getContentExtensions(),
    options: {
      nodeMapping: {
        image: ({ node }) => {
          const attrs = node.attrs as FigureImageAttrs;
          if (!isOwnImageSrc(attrs.src)) return "";
          const size =
            attrs.width && attrs.height
              ? ` width="${attrs.width}" height="${attrs.height}"`
              : "";
          const caption = attrs.caption
            ? `<figcaption>${escapeAttr(attrs.caption)}</figcaption>`
            : "";
          return `<figure><img src="${escapeAttr(absolute(attrs.src))}" alt="${escapeAttr(attrs.alt)}"${size}>${caption}</figure>`;
        },
      },
      markMapping: {
        link: ({ mark, children }) => {
          const inner = Array.isArray(children)
            ? children.join("")
            : (children ?? "");
          const href = String(mark.attrs.href ?? "");
          if (!isSafeHref(href)) return inner;
          const rel = mark.attrs.rel
            ? ` rel="${escapeAttr(String(mark.attrs.rel))}"`
            : "";
          return `<a href="${escapeAttr(absolute(href))}"${rel}>${inner}</a>`;
        },
      },
    },
  });
}
