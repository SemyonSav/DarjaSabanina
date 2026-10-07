import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { listCategories } from "@/lib/repos";
import { PageHeader } from "@/components/admin/ui";
import { getSiteSettings } from "@/lib/home/content";
import { ArticleForm } from "@/components/admin/articles/ArticleForm";
import { newArticleInitial } from "@/components/admin/articles/initial";

export const metadata: Metadata = { title: "Новая статья" };

export default async function NewArticlePage() {
  await requireAdmin();
  const categories = await listCategories();

  return (
    <>
      <PageHeader title="Новая статья" />
      <ArticleForm
        initial={newArticleInitial()}
        categories={categories}
        siteName={(await getSiteSettings()).name}
      />
    </>
  );
}
