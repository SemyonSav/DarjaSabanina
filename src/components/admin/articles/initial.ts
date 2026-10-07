import type { Article } from "@/types";
import type { ArticleFormInitial } from "./ArticleForm";

export const emptyDoc = { type: "doc", content: [] };

export function newArticleInitial(): ArticleFormInitial {
  return {
    status: "draft",
    publishedAt: null,
    cover: null,
    ogImage: null,
    values: {
      title: "",
      slug: "",
      categoryId: null,
      excerpt: "",
      content: emptyDoc,
      coverImageId: null,
      featured: false,
      seoTitle: "",
      seoDescription: "",
      focusKeyword: "",
      keywords: [],
      canonicalUrl: "",
      noindex: false,
      ogImageId: null,
    },
  };
}

export function articleToInitial(article: Article): ArticleFormInitial {
  return {
    id: article.id,
    status: article.status,
    publishedAt: article.publishedAt,
    updatedAt: article.updatedAt,
    cover: article.cover,
    ogImage: article.ogImage,
    values: {
      title: article.title,
      slug: article.slug,
      categoryId: article.category?.id ?? null,
      excerpt: article.excerpt,
      content: article.content,
      coverImageId: article.cover?.id ?? null,
      featured: article.featured,
      seoTitle: article.seoTitle,
      seoDescription: article.seoDescription,
      focusKeyword: article.focusKeyword,
      keywords: article.keywords,
      canonicalUrl: article.canonicalUrl,
      noindex: article.noindex,
      ogImageId: article.ogImage?.id ?? null,
    },
  };
}
