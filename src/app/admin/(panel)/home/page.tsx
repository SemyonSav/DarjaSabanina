import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getLayout, isBlockCustomized } from "@/lib/repos";
import { HOME_SECTIONS, type HomeSectionKey } from "@/lib/home/schema";
import { blockDefinitions } from "@/lib/home/fields";
import { PageHeader } from "@/components/admin/ui";
import { SectionList } from "@/components/admin/home/SectionList";

export const metadata: Metadata = { title: "Главная страница" };

export default async function HomeSectionsPage() {
  await requireAdmin();
  const [layout, flags] = await Promise.all([
    getLayout(),
    Promise.all(HOME_SECTIONS.map((key) => isBlockCustomized(key))),
  ]);
  const titles = Object.fromEntries(
    HOME_SECTIONS.map((key) => [key, blockDefinitions[key].title]),
  ) as Record<HomeSectionKey, string>;
  const customized = Object.fromEntries(
    HOME_SECTIONS.map((key, i) => [key, flags[i]]),
  ) as Record<HomeSectionKey, boolean>;

  return (
    <>
      <PageHeader
        title="Главная страница"
        description="Порядок блоков — перетаскиванием или стрелками. Скрытый блок пропадает со страницы и из меню. Изменения сохраняются сразу."
        actions={
          <a
            href="/"
            target="_blank"
            rel="noopener"
            className="inline-flex h-11 items-center gap-2 rounded-[0.9rem] border border-border px-4 text-[0.95rem] transition hover:border-accent hover:text-accent"
          >
            <ExternalLink className="size-4" />
            Открыть главную
          </a>
        }
      />
      <SectionList layout={layout} titles={titles} customized={customized} />
    </>
  );
}
