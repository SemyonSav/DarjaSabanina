import { expect, test } from "@playwright/test";
import { E2E_LOGIN, E2E_PASSWORD } from "./credentials";

test("вход → новая статья → публикация → статья на сайте → удаление", async ({
  page,
}) => {
  const title = `Проверочная статья ${Date.now()}`;

  // Без входа админка недоступна
  await page.goto("/admin/articles");
  await expect(page).toHaveURL(/\/admin\/login/);

  await page.getByLabel("Логин").fill(E2E_LOGIN);
  await page.getByLabel("Пароль").fill("неверный пароль");
  await page.getByRole("button", { name: "Войти" }).click();
  await expect(page.getByText("Неверный логин или пароль")).toBeVisible();

  await page.getByLabel("Пароль").fill(E2E_PASSWORD);
  await page.getByRole("button", { name: "Войти" }).click();
  await expect(page).toHaveURL(/\/admin\/articles$/);

  // Исходные статьи перенесены при первом запуске
  await expect(page.getByText("Тревога как сигнал")).toBeVisible();

  await page.getByRole("link", { name: "Новая статья" }).click();
  await page.getByLabel("Заголовок (H1)").fill(title);
  await expect(page.getByLabel("Адрес статьи")).toHaveValue(
    /^proverochnaya-statya-\d+$/,
  );
  const slug = await page.getByLabel("Адрес статьи").inputValue();
  await page.getByLabel("Анонс").fill("Короткий анонс для проверки.");

  // Текст в редакторе с markdown-сокращением заголовка
  const editor = page.locator(".tiptap-content");
  await editor.click();
  await page.keyboard.type("## Раздел статьи");
  await page.keyboard.press("Enter");
  await page.keyboard.type("Первый абзац проверочной статьи.");
  await expect(editor.locator("h2")).toHaveText("Раздел статьи");

  await page.getByRole("button", { name: "Опубликовать" }).click();
  await expect(page).toHaveURL(/\/admin\/articles\/\d+$/);
  await expect(
    page.getByRole("status").filter({ hasText: "Статья опубликована" }),
  ).toBeVisible();

  // Статья на сайте — с микроразметкой и в sitemap
  await page.goto(`/articles/${slug}`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
  await expect(page.locator(".prose-article h2")).toHaveText("Раздел статьи");
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(2);
  const sitemap = await (await page.request.get("/sitemap.xml")).text();
  expect(sitemap).toContain(`/articles/${slug}`);

  // Удаление
  await page.goBack();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Удалить" }).click();
  await expect(page).toHaveURL(/\/admin\/articles$/);
  const response = await page.request.get(`/articles/${slug}`);
  expect(response.status()).toBe(404);
});
