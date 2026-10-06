import Image from "next/image";
import { renderToReactElement } from "@tiptap/static-renderer/pm/react";
import type { JSONContent } from "@tiptap/core";
import { getContentExtensions } from "@/lib/content/extensions";
import { collectHeadings, type HeadingEntry } from "@/lib/content/headings";
import {
  isOwnImageSrc,
  type FigureImageAttrs,
} from "@/lib/content/figure-image";
import { isSafeHref } from "@/lib/content/links";

/** Оглавление по H2 — показываем, когда разделов хотя бы три */
export function TableOfContents({ headings }: { headings: HeadingEntry[] }) {
  const sections = headings.filter((h) => h.level === 2);
  if (sections.length < 3) return null;
  return (
    <nav
      aria-label="Содержание статьи"
      className="mb-10 rounded-[1.25rem] border border-border bg-warm/70 p-6 dark:bg-muted/40"
    >
      <p className="mb-3 text-sm font-medium tracking-[0.12em] uppercase text-accent">
        Содержание
      </p>
      <ol className="list-decimal space-y-1.5 pl-5 text-muted-foreground marker:text-accent">
        {sections.map((h) => (
          <li key={h.id}>
            <a href={`#${h.id}`} className="transition hover:text-accent">
              {h.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Серверный рендер документа Tiptap в семантическую разметку */
export function ArticleBody({ content }: { content: JSONContent }) {
  const headings = collectHeadings(content);
  let headingIndex = 0;

  const body = renderToReactElement({
    content,
    extensions: getContentExtensions(),
    options: {
      nodeMapping: {
        heading: ({ node, children }) => {
          const entry = headings[headingIndex++];
          const level = Math.min(Math.max(Number(node.attrs.level) || 2, 2), 4);
          const Tag = `h${level}` as "h2" | "h3" | "h4";
          return (
            <Tag id={entry?.id} className="scroll-mt-28">
              {children}
            </Tag>
          );
        },
        image: ({ node }) => {
          const attrs = node.attrs as FigureImageAttrs;
          if (!isOwnImageSrc(attrs.src)) return null;
          return (
            <figure>
              {attrs.width && attrs.height ? (
                <Image
                  src={attrs.src}
                  alt={attrs.alt}
                  width={attrs.width}
                  height={attrs.height}
                  sizes="(max-width: 768px) 100vw, 768px"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element -- размеры неизвестны
                <img
                  src={attrs.src}
                  alt={attrs.alt}
                  loading="lazy"
                  decoding="async"
                />
              )}
              {attrs.caption ? <figcaption>{attrs.caption}</figcaption> : null}
            </figure>
          );
        },
      },
      markMapping: {
        link: ({ mark, children }) => {
          const href = String(mark.attrs.href ?? "");
          if (!isSafeHref(href)) return <>{children}</>;
          return (
            <a
              href={href}
              target={mark.attrs.target ?? undefined}
              rel={mark.attrs.rel ?? undefined}
            >
              {children}
            </a>
          );
        },
      },
    },
  });

  return (
    <>
      <TableOfContents headings={headings} />
      <div className="prose-article">{body}</div>
    </>
  );
}
