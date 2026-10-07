import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  // tsconfig оставляет JSX как есть (его компилирует Next) — тестам нужен рантайм
  oxc: { jsx: { runtime: "automatic" } },
  test: {
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    environment: "node",
    env: {
      AUTH_SECRET: "test-secret-test-secret-test-secret-123",
      NEXT_PUBLIC_SITE_URL: "https://example.ru",
    },
  },
});
