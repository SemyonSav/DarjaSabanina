import { expect, test } from "@playwright/test";
import { login } from "./helpers";

test("редактирование первого экрана и видимость блоков главной", async ({
  page,
}) => {
  await login(page, "/admin/home");

  // Первый экран: новый заголовок и текст
  await page.getByRole("link", { name: "Изменить" }).first().click();
  await expect(page).toHaveURL(/\/admin\/home\/hero$/);
  await page.getByLabel("Заголовок (H1)").fill("Новое имя на главной");
  await page
    .getByLabel("Текст", { exact: true })
    .fill("Первая строка\nВторая строка");
  await page.getByRole("button", { name: "Сохранить" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Сохранено" }),
  ).toBeVisible();

  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Новое имя на главной",
  );
  await expect(page.getByText("Вторая строка")).toBeVisible();

  // Скрываем FAQ — пропадает со страницы и из меню
  await page.goto("/admin/home");
  const faqRow = page
    .getByRole("listitem")
    .filter({ hasText: "Частые вопросы" });
  await faqRow.getByRole("button", { name: "Скрыть блок" }).click();
  await expect(
    faqRow.getByRole("button", { name: "Показать блок" }),
  ).toBeVisible();

  await page.goto("/");
  await expect(page.locator("#faq")).toHaveCount(0);
  await expect(
    page
      .getByRole("navigation", { name: "Основная" })
      .getByRole("link", { name: "FAQ" }),
  ).toHaveCount(0);

  // Возвращаем как было
  await page.goto("/admin/home");
  await faqRow.getByRole("button", { name: "Показать блок" }).click();
  await expect(
    faqRow.getByRole("button", { name: "Скрыть блок" }),
  ).toBeVisible();
  await page.goto("/admin/home/hero");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Сбросить к исходному" }).click();
  // После сброса страница перезагружается — кнопка сброса исчезает
  await expect(
    page.getByRole("button", { name: "Сбросить к исходному" }),
  ).toHaveCount(0);
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Дарья Сабанина",
  );
  await expect(page.locator("#faq")).toHaveCount(1);
});
