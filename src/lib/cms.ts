import { cache } from "react";
import * as repos from "@/lib/repos";

/**
 * Данные для публичных страниц. Отдаются только опубликованные статьи.
 * `cache` убирает повторные запросы в рамках одного рендера
 * (например, generateMetadata + страница).
 */

export const getArticles = cache(() => repos.listPublishedArticles());

export const getArticleBySlug = cache((slug: string) =>
  repos.getPublishedArticleBySlug(slug),
);

export const getFeaturedArticles = cache((limit = 3) =>
  repos.listFeaturedArticles(limit),
);

export const getRelatedArticles = repos.listRelatedArticles;

export const ARTICLES_PER_PAGE = 9;

/** Страница списка статей; null — если такой страницы нет */
export const getArticlesPage = cache(
  async (page: number, categoryId?: number) => {
    const total = await repos.countPublishedArticles(categoryId);
    const pages = Math.max(1, Math.ceil(total / ARTICLES_PER_PAGE));
    if (!Number.isInteger(page) || page < 1 || page > pages) return null;
    const articles = await repos.listPublishedArticles({
      categoryId,
      limit: ARTICLES_PER_PAGE,
      offset: (page - 1) * ARTICLES_PER_PAGE,
    });
    return { articles, total, page, pages };
  },
);

export const getCategoryBySlug = cache((slug: string) =>
  repos.getCategoryBySlug(slug),
);

export const getCategoriesWithArticles = cache(() =>
  repos.listCategoriesWithPublished(),
);

export const getTestimonials = cache(() => repos.listPublishedTestimonials());
