import type { Extensions } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { FigureImage } from "./figure-image";

/** H1 зарезервирован под заголовок статьи */
export const HEADING_LEVELS = [2, 3, 4] as const;

/**
 * Набор расширений, общий для редактора и рендера на сайте:
 * то, что можно создать в редакторе, всегда можно и отрисовать.
 */
export function getContentExtensions(): Extensions {
  return [
    StarterKit.configure({
      heading: { levels: [...HEADING_LEVELS] },
      code: false,
      codeBlock: false,
      link: {
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
        HTMLAttributes: { rel: null, target: null },
      },
    }),
    FigureImage,
  ];
}
