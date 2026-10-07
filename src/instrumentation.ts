/**
 * Выполняется один раз при старте сервера: применяет миграции БД,
 * а на пустой базе (первый запуск) переносит исходные статьи и отзывы.
 * Код для Node.js — в отдельном файле, чтобы не попасть в edge-сборку.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./instrumentation-node");
  }
}
