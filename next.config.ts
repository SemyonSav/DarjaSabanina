import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    // Middleware проверяет доступ к /api/admin/*; без этого тело запроса
    // обрезается на 10 МБ, а загружать можно картинки до 15 МБ
    middlewareClientMaxBodySize: "16mb",
  },
};

export default nextConfig;
