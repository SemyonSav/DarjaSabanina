import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Eye } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getArticlePreview } from "@/lib/repos";
import { Container } from "@/components/ui/Container";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { ArticleView } from "@/components/articles/ArticleView";

export const metadata: Metadata = {
  title: "Предпросмотр",
  robots: { index: false, follow: false },
};

export default async function ArticlePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const id = Number((await params).id);
  const article = Number.isInteger(id) && id > 0 ? await getArticlePreview(id) : null;
  if (!article) notFound();

  return (
    <>
      <div className="sticky top-0 z-[60] flex flex-wrap items-center justify-center gap-x-4 gap-y-1 bg-accent px-4 py-2 text-center text-sm text-accent-foreground">
        <span className="inline-flex items-center gap-2 font-medium">
          <Eye className="size-4" />
          Предпросмотр
          {article.status === "draft" ? " · черновик, на сайте не виден" : ""}
          {article.hasAutosave ? " · с несохранёнными правками" : ""}
        </span>
        <Link href={`/admin/articles/${article.id}`} className="underline">
          Вернуться к редактированию
        </Link>
      </div>
      <SiteChrome>
        <Container className="py-14 md:py-20">
          <ArticleView article={article} />
        </Container>
      </SiteChrome>
    </>
  );
}
