import { Fragment, type ReactNode } from "react";
import { isSafeHref } from "@/lib/content/links";
import type { RichDoc, RichInline } from "@/lib/home/rich-text";

/**
 * Вывод форматированного текста блоков главной. Без зависимостей —
 * работает и в серверных, и в клиентских компонентах.
 */

function renderInline(node: RichInline, key: number): ReactNode {
  if (node.type === "hardBreak") return <br key={key} />;
  let result: ReactNode = node.text;
  for (const mark of node.marks ?? []) {
    switch (mark.type) {
      case "bold":
        result = <strong className="font-semibold">{result}</strong>;
        break;
      case "italic":
        result = <em>{result}</em>;
        break;
      case "underline":
        result = <u className="underline-offset-[3px]">{result}</u>;
        break;
      case "strike":
        result = <s>{result}</s>;
        break;
      case "link": {
        const href = mark.attrs?.href ?? "";
        if (!isSafeHref(href)) break;
        result = (
          <a
            href={href}
            target={mark.attrs?.target ?? undefined}
            rel={mark.attrs?.rel ?? undefined}
            className="underline decoration-1 underline-offset-[3px] transition hover:decoration-2"
          >
            {result}
          </a>
        );
        break;
      }
    }
  }
  return <Fragment key={key}>{result}</Fragment>;
}

export function RichText({
  value,
  paragraphClassName,
  prefix,
}: {
  value: RichDoc;
  /** Класс каждого абзаца */
  paragraphClassName?: string;
  /** Текст в начале первого абзаца (например, специализация в подвале) */
  prefix?: ReactNode;
}) {
  const paragraphs = value.content.filter((p) => p.content?.length);
  if (!paragraphs.length) {
    return prefix ? <p className={paragraphClassName}>{prefix}</p> : null;
  }
  return (
    <>
      {paragraphs.map((paragraph, index) => (
        <p key={index} className={paragraphClassName}>
          {index === 0 ? prefix : null}
          {paragraph.content?.map(renderInline)}
        </p>
      ))}
    </>
  );
}
