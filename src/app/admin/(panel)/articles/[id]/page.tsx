import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getArticleById, listCategories } from "@/lib/repos";
import { PageHeader } from "@/components/admin/ui";
import { ArticleForm } from "@/components/admin/articles/ArticleForm";
import { articleToInitial } from "@/components/admin/articles/initial";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function loadArticle(params: PageProps["params"]) {
  const id = Number((await params).id);
  return Number.isInteger(id) && id > 0 ? getArticleById(id) : null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const article = await loadArticle(params);
  return { title: article ? `Редактирование: ${article.title}` : "Статья" };
}

export default async function EditArticlePage({ params }: PageProps) {
  await requireAdmin();
  const [article, categories] = await Promise.all([
    loadArticle(params),
    listCategories(),
  ]);
  if (!article) notFound();

  return (
    <>
      <PageHeader title="Редактирование статьи" />
      <ArticleForm
        initial={articleToInitial(article)}
        categories={categories}
      />
    </>
  );
}
