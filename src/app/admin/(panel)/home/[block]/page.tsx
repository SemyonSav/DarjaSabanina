import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import {
  HOME_SECTIONS,
  SECTION_ANCHORS,
  type HomeSectionKey,
} from "@/lib/home/schema";
import { blockDefinitions } from "@/lib/home/fields";
import { BlockEditPage } from "@/components/admin/home/BlockEditPage";

interface PageProps {
  params: Promise<{ block: string }>;
}

function sectionKey(value: string): HomeSectionKey | null {
  return (HOME_SECTIONS as readonly string[]).includes(value)
    ? (value as HomeSectionKey)
    : null;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const key = sectionKey((await params).block);
  return { title: key ? blockDefinitions[key].title : "Блок" };
}

export default async function EditHomeBlockPage({ params }: PageProps) {
  await requireAdmin();
  const key = sectionKey((await params).block);
  if (!key) notFound();

  return (
    <BlockEditPage
      blockKey={key}
      backHref="/admin/home"
      backLabel="Главная страница"
      previewHref={key === "hero" ? "/" : `/#${SECTION_ANCHORS[key]}`}
    />
  );
}
