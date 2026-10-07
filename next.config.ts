import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Самодостаточная сборка для Docker: .next/standalone + server.js
  output: "standalone",
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Метаданные (title, description, canonical) — сразу в <head> для всех,
  // а не потоком в конце <body>: так их гарантированно видят все поисковики
  // и сервисы проверки. Страницы рендерятся быстро, стриминг тут не нужен.
  htmlLimitedBots: /.*/,
  // Файлы, которые читаются с диска, а не импортируются
  outputFileTracingIncludes: {
    "/admin/seo-guide": ["./src/content/**/*"],
    "**/*": ["./drizzle/**/*"],
  },
  experimental: {
    // Middleware проверяет доступ к /api/admin/*; без этого тело запроса
    // обрезается на 10 МБ, а загружать можно картинки до 15 МБ
    middlewareClientMaxBodySize: "16mb",
  },
};

export default nextConfig;
