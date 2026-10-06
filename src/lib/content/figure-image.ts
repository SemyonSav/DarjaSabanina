import { Node, mergeAttributes } from "@tiptap/core";

export interface FigureImageAttrs {
  src: string;
  alt: string;
  width: number | null;
  height: number | null;
  caption: string;
  mediaId: number | null;
}

/** Картинки принимаем только из своего хранилища — без хотлинка чужих сайтов */
export function isOwnImageSrc(src: unknown): src is string {
  return typeof src === "string" && /^\/uploads\/[\w./-]+$/.test(src) && !src.includes("..");
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    figureImage: {
      insertFigureImage: (
        attrs: FigureImageAttrs,
        position?: number,
      ) => ReturnType;
      updateFigureImage: (attrs: Partial<FigureImageAttrs>) => ReturnType;
    };
  }
}

function toNumber(value: string | null): number | null {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * Иллюстрация в тексте статьи: `<figure><img><figcaption>`.
 * width/height нужны браузеру заранее, чтобы вёрстка не прыгала (CLS).
 */
export const FigureImage = Node.create({
  name: "image",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    // Атрибуты выводим вручную в renderHTML (на <img>, а не на <figure>)
    return {
      src: { default: "", rendered: false },
      alt: { default: "", rendered: false },
      width: { default: null, rendered: false },
      height: { default: null, rendered: false },
      caption: { default: "", rendered: false },
      mediaId: { default: null, rendered: false },
    };
  },

  parseHTML() {
    return [
      {
        tag: "figure[data-type='image']",
        getAttrs: (element) => {
          const img = element.querySelector("img");
          const src = img?.getAttribute("src");
          if (!img || !isOwnImageSrc(src)) return false;
          return {
            src,
            alt: img.getAttribute("alt") ?? "",
            width: toNumber(img.getAttribute("width")),
            height: toNumber(img.getAttribute("height")),
            caption: element.querySelector("figcaption")?.textContent ?? "",
            mediaId: toNumber(element.getAttribute("data-media-id")),
          };
        },
      },
      {
        tag: "img[src]",
        getAttrs: (element) => {
          const src = element.getAttribute("src");
          if (!isOwnImageSrc(src)) return false;
          return {
            src,
            alt: element.getAttribute("alt") ?? "",
            width: toNumber(element.getAttribute("width")),
            height: toNumber(element.getAttribute("height")),
          };
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const { src, alt, width, height, caption, mediaId } =
      node.attrs as FigureImageAttrs;
    const img = [
      "img",
      {
        src,
        alt,
        ...(width && height
          ? { width: String(width), height: String(height) }
          : {}),
        loading: "lazy",
        decoding: "async",
      },
    ] as const;
    const figureAttrs = mergeAttributes(HTMLAttributes, {
      "data-type": "image",
      ...(mediaId ? { "data-media-id": String(mediaId) } : {}),
    });
    return caption
      ? ["figure", figureAttrs, img, ["figcaption", {}, caption]]
      : ["figure", figureAttrs, img];
  },

  addCommands() {
    return {
      insertFigureImage:
        (attrs, position) =>
        ({ chain }) => {
          const content = { type: this.name, attrs };
          return position === undefined
            ? chain().insertContent(content).run()
            : chain().insertContentAt(position, content).run();
        },
      updateFigureImage:
        (attrs) =>
        ({ commands }) =>
          commands.updateAttributes(this.name, attrs),
    };
  },
});
