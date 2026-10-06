# Психолог — сайт с блогом и админкой

Сайт-визитка психолога со статьями и панелью администратора: статьи с собственным редактором, рубрики, отзывы, медиатека. Особое внимание уделено SEO для Яндекса и Google.

## Стек

- Next.js 15 (App Router), React 19, TypeScript
- Tailwind CSS 4, Framer Motion, Lucide Icons, next-themes
- SQLite (better-sqlite3) + Drizzle ORM
- Tiptap — редактор статей
- sharp — обработка изображений

## Локальный запуск

```bash
npm install
cp .env.example .env.local
```

Заполните в `.env.local`:

- `ADMIN_PASSWORD_HASH` — сгенерируйте командой ниже и вставьте строку целиком;
- `AUTH_SECRET` — случайная строка от 32 символов (`openssl rand -base64 48`).

```bash
npm run admin:hash-password -- "ваш-пароль"
```

```bash
npm run dev
```

Сайт — [http://localhost:3000](http://localhost:3000), админка — [http://localhost:3000/admin](http://localhost:3000/admin).

При первом запуске сервер сам создаёт базу в `./data`, применяет миграции и переносит исходные статьи и отзывы. Папка `data` в git не попадает.

## Переменные окружения

| Переменная | Назначение |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Адрес сайта: canonical, sitemap, Open Graph. На проде — `https://ваш-домен.ru` |
| `DATA_DIR` | Папка данных: база `site.db` и картинки `uploads/` |
| `ADMIN_LOGIN` | Логин администратора (по умолчанию `admin`) |
| `ADMIN_PASSWORD_HASH` | Хеш пароля (`npm run admin:hash-password`) |
| `AUTH_SECRET` | Секрет подписи сессии, от 32 символов |
| `INDEXNOW_KEY` | Ключ IndexNow — уведомления Яндекса и Bing о новых статьях |
| `GOOGLE_SITE_VERIFICATION`, `YANDEX_VERIFICATION` | Коды подтверждения прав в Search Console и Вебмастере |
| `NEXT_PUBLIC_YANDEX_METRIKA_ID` | Номер счётчика Яндекс.Метрики (необязательно) |
| `SEED_ON_EMPTY` | `false` — не наполнять пустую базу исходными статьями |

`NEXT_PUBLIC_*` встраиваются в код при сборке: после их изменения сайт нужно пересобрать.

## Команды

| Команда | Что делает |
|---|---|
| `npm run dev` | Сервер разработки |
| `npm run build` / `npm start` | Production-сборка и запуск |
| `npm run admin:hash-password -- "пароль"` | Хеш пароля администратора |
| `npm run db:generate` | Создать миграцию после изменения `src/lib/db/schema.ts` |
| `npm run db:migrate` | Применить миграции (сервер делает это и сам при старте) |
| `npm run db:seed` | Перенести исходные статьи и отзывы (повторный запуск ничего не дублирует) |
| `npm run db:studio` | Просмотр базы в браузере (Drizzle Studio) |

## Структура

```
src/
  app/
    (site)/            # публичные страницы: главная, статьи, рубрики, политика
    admin/             # админка: вход, статьи, рубрики, отзывы, медиатека, справка
    api/admin/media/   # загрузка изображений
    uploads/           # отдача загруженных файлов
    sitemap.ts, robots.ts, rss.xml/, indexnow.txt/
  components/
    admin/             # интерфейс админки и редактор (editor/)
    articles/          # статья, карточки, список, оглавление
    sections/          # секции лендинга
    seo/               # JSON-LD, хлебные крошки
  content/seo-guide.md # справка «Как писать для SEO» (показывается в админке)
  lib/
    db/                # схема, подключение, миграции, первичные данные
    repos/             # запросы к базе
    content/           # рендер статей, ссылки, вставка, проверки SEO
    seo/               # метаданные, микроразметка, IndexNow
    auth/              # сессия администратора
  instrumentation.ts   # миграции и наполнение базы при старте
drizzle/               # миграции БД
deploy/                # nginx, бэкап и восстановление
docs/                  # план разработки админки
```

## Деплой на VPS

Нужен VPS с Docker (1–2 ГБ RAM), лучше в РФ — из-за персональных данных в форме заявки (152-ФЗ).

1. Склонируйте репозиторий, например в `/opt/site`, и создайте `.env` по образцу `.env.example`. Укажите в нём боевой адрес `NEXT_PUBLIC_SITE_URL=https://ваш-домен.ru`.
2. Создайте папку данных — приложение в контейнере работает от пользователя с uid 1001:

   ```bash
   mkdir -p data && sudo chown 1001:1001 data
   ```

3. Соберите и запустите:

   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   ```

   Сайт слушает `127.0.0.1:3000`.
4. Настройте nginx по образцу `deploy/nginx.conf` (замените домен) и выпустите сертификат:

   ```bash
   sudo certbot --nginx -d ваш-домен.ru -d www.ваш-домен.ru
   ```

5. Обновление сайта: `git pull` и снова `docker compose -f docker-compose.prod.yml up -d --build`. Миграции базы применятся автоматически.

## Бэкапы

Вся информация сайта — в папке `data`: база и картинки. Ежедневный бэкап:

```bash
sudo apt install sqlite3          # один раз
crontab -e
# 30 3 * * * cd /opt/site && ./deploy/backup.sh >> /var/log/site-backup.log 2>&1
```

Скрипт хранит 14 последних архивов в `./backups`. **Обязательно** настройте копию вне сервера — например, на Яндекс Диск через [rclone](https://rclone.org/yandex/) и переменную `REMOTE="yandex:site-backups"`.

Восстановление:

```bash
./deploy/restore.sh backups/site-2026-10-06_03-30.tar.gz
```

## Домен и поисковики

После переезда на свой домен:

1. **Яндекс Вебмастер** ([webmaster.yandex.ru](https://webmaster.yandex.ru)): добавьте сайт, подтвердите через мета-тег (значение — в `YANDEX_VERIFICATION`), укажите sitemap `https://ваш-домен.ru/sitemap.xml`.
2. **Google Search Console** ([search.google.com/search-console](https://search.google.com/search-console)): то же самое, значение — в `GOOGLE_SITE_VERIFICATION`.
3. **IndexNow**: задайте `INDEXNOW_KEY` (`openssl rand -hex 16`). Сайт будет сам сообщать поисковикам о новых и изменённых статьях. Проверить ключ: `https://ваш-домен.ru/indexnow.txt`.
4. Пересоберите и перезапустите контейнер.

Советы по написанию статей — в админке, раздел «Справка по SEO».
