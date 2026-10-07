import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { MediaImage } from "@/types";
import { getBlock, getMediaById, isBlockCustomized } from "@/lib/repos";
import { toMediaImage } from "@/lib/repos/mappers";
import type { BlockKey } from "@/lib/home/schema";
import { blockDefinitions } from "@/lib/home/fields";
import { PageHeader } from "@/components/admin/ui";
import { BlockForm } from "./BlockForm";

/** Картинки, выбранные в блоке, — для превью в форме */
async function loadMedia(
  key: BlockKey,
  value: Record<string, unknown>,
): Promise<Record<number, MediaImage>> {
  const ids = blockDefinitions[key].fields
    .filter((field) => field.type === "image")
    .map((field) => value[field.name])
    .filter((id): id is number => typeof id === "number");
  const images = await Promise.all(
    ids.map(async (id) => toMediaImage(await getMediaById(id))),
  );
  return Object.fromEntries(
    images
      .filter((image): image is MediaImage => Boolean(image))
      .map((i) => [i.id, i]),
  );
}

/** Страница редактирования блока (секции главной или настроек сайта) */
export async function BlockEditPage({
  blockKey,
  backHref,
  backLabel,
  previewHref,
}: {
  blockKey: BlockKey;
  backHref?: string;
  backLabel?: string;
  previewHref: string;
}) {
  const definition = blockDefinitions[blockKey];
  const [value, customized] = await Promise.all([
    getBlock(blockKey),
    isBlockCustomized(blockKey),
  ]);
  const data = value as Record<string, unknown>;

  return (
    <>
      {backHref ? (
        <Link
          href={backHref}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {backLabel}
        </Link>
      ) : null}
      <PageHeader
        title={definition.title}
        description={definition.description}
      />
      <BlockForm
        blockKey={blockKey}
        definition={definition}
        initial={data}
        media={await loadMedia(blockKey, data)}
        customized={customized}
        previewHref={previewHref}
      />
    </>
  );
}
