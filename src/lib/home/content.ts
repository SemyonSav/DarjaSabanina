import { cache } from "react";
import * as repos from "@/lib/repos";
import { toMediaImage } from "@/lib/repos/mappers";
import { siteConfig } from "@/lib/site";
import type { NavItem } from "@/types";
import { SECTION_ANCHORS, type BlockData, type HomeSectionKey } from "./schema";

export interface SiteImage {
  url: string;
  alt: string;
  width: number;
  height: number;
}

export interface SiteContacts {
  phone: string;
  /** tel:+79001234567 */
  phoneHref: string;
  email: string;
  telegram: string;
  whatsapp: string;
  address: string;
}

/** Общие настройки сайта для шапки, подвала, метаданных и микроразметки */
export interface SiteSettings {
  name: string;
  jobTitle: string;
  description: string;
  footerText: string;
  seoTitle: string;
  seoDescription: string;
  contacts: SiteContacts;
  /** Фото специалиста (первый экран, микроразметка) */
  photo: SiteImage;
  /** Картинка для соцсетей по умолчанию */
  shareImage: SiteImage;
  nav: NavItem[];
}

/** Фото из public/, пока в админке не выбрано другое */
const DEFAULT_PHOTO = {
  url: siteConfig.defaultPhoto,
  width: 1200,
  height: 1800,
};

export function phoneHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  return digits ? `tel:${digits.startsWith("+") ? digits : `+${digits}`}` : "";
}

async function mediaImage(id: number | null): Promise<SiteImage | null> {
  if (!id) return null;
  const image = toMediaImage(await repos.getMediaById(id));
  return (
    image && {
      url: image.url,
      alt: image.alt,
      width: image.width,
      height: image.height,
    }
  );
}

export const getLayout = cache(() => repos.getLayout());

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const [general, contacts, hero, layout] = await Promise.all([
    repos.getBlock("general"),
    repos.getBlock("contacts"),
    repos.getBlock("hero"),
    getLayout(),
  ]);
  const [heroPhoto, ogImage] = await Promise.all([
    mediaImage(hero.photoId),
    mediaImage(general.ogImageId),
  ]);
  const photo: SiteImage = {
    ...(heroPhoto ?? DEFAULT_PHOTO),
    alt: hero.photoAlt || heroPhoto?.alt || general.name,
  };

  return {
    name: general.name,
    jobTitle: general.jobTitle,
    description: general.description,
    footerText: general.footerText,
    seoTitle: general.seoTitle,
    seoDescription: general.seoDescription,
    contacts: { ...contacts, phoneHref: phoneHref(contacts.phone) },
    photo,
    shareImage: ogImage ?? photo,
    nav: layout.sections
      .filter((s) => s.visible && s.navLabel)
      .map((s) => ({ href: `/#${SECTION_ANCHORS[s.key]}`, label: s.navLabel })),
  };
});

export type HomeSection =
  | { key: "hero"; data: BlockData<"hero"> }
  | { key: "requests"; data: BlockData<"requests"> }
  | { key: "method"; data: BlockData<"method"> }
  | { key: "blog"; data: BlockData<"blog"> }
  | { key: "advantages"; data: BlockData<"advantages"> }
  | { key: "testimonials"; data: BlockData<"testimonials"> }
  | { key: "faq"; data: BlockData<"faq"> }
  | { key: "contact"; data: BlockData<"contact"> };

/** Видимые секции главной в заданном порядке, с содержимым */
export const getHomeSections = cache(async (): Promise<HomeSection[]> => {
  const layout = await getLayout();
  const visible = layout.sections.filter((s) => s.visible).map((s) => s.key);
  return Promise.all(
    visible.map(
      async (key: HomeSectionKey) =>
        ({ key, data: await repos.getBlock(key) }) as HomeSection,
    ),
  );
});
