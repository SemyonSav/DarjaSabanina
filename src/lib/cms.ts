/**
 * Точка расширения для CMS (Sanity / Contentlayer / MDX).
 *
 * Сейчас статьи живут в `lib/articles.ts`.
 * Чтобы подключить CMS:
 * 1. Реализуйте fetch в этом модуле
 * 2. Замените импорты getArticles/getArticleBySlug на функции отсюда
 * 3. UI-компоненты менять не нужно — контракт типов в `types/index.ts`
 */

export {
  getArticles,
  getArticleBySlug,
  getFeaturedArticles,
  getRelatedArticles,
  getAllArticleSlugs,
} from "./articles";
