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

export const getTestimonials = cache(() => repos.listPublishedTestimonials());
