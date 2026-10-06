import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    include: ["tests/unit/**/*.test.ts"],
    environment: "node",
    env: {
      AUTH_SECRET: "test-secret-test-secret-test-secret-123",
      NEXT_PUBLIC_SITE_URL: "https://example.ru",
    },
  },
});
