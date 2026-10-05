# Психолог — Landing

Современный одностраничный сайт-визитка психолога с отдельными страницами статей.

## Стек

- Next.js 15 (App Router)
- React 19 + TypeScript
- Tailwind CSS 4
- Framer Motion
- Lucide Icons
- next-themes (Dark Mode)

## Запуск

```bash
npm install
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

## Структура

```
src/
  app/                 # страницы (главная, статьи, 404, политика)
  components/
    ui/                # кнопки, аккордеон, skeleton, loader...
    layout/            # header, footer, providers
    sections/          # секции лендинга
    articles/          # контент статей
    seo/               # Schema.org
  lib/                 # site config, articles API, utils
  types/               # TypeScript-типы
content ready via lib/articles.ts
```

## Контент

- Данные специалиста: `src/lib/site.ts`
- Статьи: `src/lib/articles.ts` (CMS-ready слой `getArticles` / `getArticleBySlug`)
- Фото: `public/avatar.jpg`

## Сборка

```bash
npm run build
npm start
```

## Переменные окружения

Скопируйте `.env.example` → `.env.local`:

```
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```
