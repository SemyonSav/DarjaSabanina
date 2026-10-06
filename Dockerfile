# syntax=docker/dockerfile:1

# Сайт с админкой: Next.js (standalone) + SQLite.
# База и загруженные картинки — в томе /app/data.

FROM node:22-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# --- Зависимости (better-sqlite3 и sharp ставятся готовыми сборками) ---
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# --- Сборка ---
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NEXT_PUBLIC_* встраиваются в код при сборке
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_YANDEX_METRIKA_ID
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_YANDEX_METRIKA_ID=$NEXT_PUBLIC_YANDEX_METRIKA_ID
RUN npm run build

# --- Запуск ---
FROM base AS runner
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    DATA_DIR=/app/data

RUN groupadd --system --gid 1001 app \
 && useradd --system --uid 1001 --gid app app \
 && mkdir -p /app/data \
 && chown app:app /app/data

COPY --from=build --chown=app:app /app/.next/standalone ./
COPY --from=build --chown=app:app /app/.next/static ./.next/static
COPY --from=build --chown=app:app /app/public ./public
COPY --from=build --chown=app:app /app/drizzle ./drizzle
COPY --from=build --chown=app:app /app/src/content ./src/content

USER app
VOLUME ["/app/data"]
EXPOSE 3000

# Миграции и первичное наполнение базы выполняются при старте (src/instrumentation.ts)
CMD ["node", "server.js"]
