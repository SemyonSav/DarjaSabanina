import { expect, test } from "@playwright/test";
import { login } from "./helpers";

test("предпросмотр статьи: сохранённая версия и несохранённые правки", async ({
  page,
  context,
}) => {
  const title = `Предпросмотр ${Date.now()}`;

  await login(page, "/admin/articles/new");
  await page.getByLabel("Заголовок (H1)").fill(title);
  await page.getByLabel("Анонс").fill("Анонс для проверки предпросмотра.");
  const editor = page.locator(".tiptap-content");
  await editor.click();
  await page.keyboard.type("Первый абзац черновика.");
  await page.getByRole("button", { name: "Сохранить черновик" }).click();
  await expect(page).toHaveURL(/\/admin\/articles\/\d+$/);

  // Без правок — ссылка открывает предпросмотр в новой вкладке
  const [saved] = await Promise.all([
    context.waitForEvent("page"),
    page.getByRole("link", { name: "Предпросмотр" }).click(),
  ]);
  await expect(saved).toHaveURL(/\/admin\/preview\/\d+$/);
  await expect(saved.getByRole("heading", { level: 1 })).toHaveText(title);
  await expect(saved.getByText("Первый абзац черновика.")).toBeVisible();
  await saved.close();

  // С несохранёнными правками — сначала автосохранение, потом предпросмотр
  await editor.click();
  await page.keyboard.press("End");
  await page.keyboard.type(" Новая правка.");
  const [edited] = await Promise.all([
    context.waitForEvent("page"),
    page.getByRole("link", { name: "Предпросмотр" }).click(),
  ]);
  await expect(edited).toHaveURL(/\/admin\/preview\/\d+$/);
  await expect(edited.getByText("Новая правка.")).toBeVisible();
  await edited.close();

  // Удаляем проверочную статью
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Удалить" }).click();
  await expect(page).toHaveURL(/\/admin\/articles$/);
});
