import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import { defineConfig } from "@playwright/test";
import { E2E_LOGIN, E2E_PASSWORD } from "./tests/e2e/credentials";

const PORT = 3200;

// Отдельная чистая база на каждый прогон; воркеры наследуют env от раннера
process.env.E2E_DATA_DIR ??= path.resolve(`.tmp/e2e-${Date.now()}`);
if (process.env.TEST_WORKER_INDEX === undefined) {
  fs.rmSync(path.resolve(".tmp"), { recursive: true, force: true });
}

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 180_000,
  // Dev-сервер компилирует страницы при первом обращении
  expect: { timeout: 30_000 },
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    // Установленный Chrome — без скачивания браузеров Playwright
    channel: "chrome",
    trace: "retain-on-failure",
  },
  webServer: {
    command: `npx next dev -p ${PORT}`,
    url: `http://localhost:${PORT}/admin/login`,
    timeout: 180_000,
    reuseExistingServer: false,
    env: {
      DATA_DIR: process.env.E2E_DATA_DIR,
      NEXT_PUBLIC_SITE_URL: `http://localhost:${PORT}`,
      ADMIN_LOGIN: E2E_LOGIN,
      ADMIN_PASSWORD_HASH: Buffer.from(
        bcrypt.hashSync(E2E_PASSWORD, 4),
      ).toString("base64"),
      AUTH_SECRET: "e2e-secret-e2e-secret-e2e-secret-0001",
    },
  },
});
