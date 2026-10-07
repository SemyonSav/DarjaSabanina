import { expect, test } from "@playwright/test";
import { login } from "./helpers";

test("оформление текста первого экрана: жирный → <strong> на сайте", async ({
  page,
}) => {
  await login(page, "/admin/home/hero");

  const editor = page.getByRole("textbox", { name: "Текст" });
  // Двойной щелчок по первому слову выделяет его, Ctrl+B — жирный
  await editor
    .locator("p")
    .first()
    .dblclick({ position: { x: 8, y: 10 } });
  await page.keyboard.press("Control+b");
  await expect(editor.locator("strong")).toHaveText(/Глубинная/);

  await page.getByRole("button", { name: "Сохранить" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Сохранено" }),
  ).toBeVisible();

  await page.goto("/");
  await expect(page.locator("strong", { hasText: "Глубинная" })).toBeVisible();

  // Возвращаем исходный текст
  await page.goto("/admin/home/hero");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Сбросить к исходному" }).click();
  await expect(
    page.getByRole("button", { name: "Сбросить к исходному" }),
  ).toHaveCount(0);
  await page.goto("/");
  await expect(page.locator("strong", { hasText: "Глубинная" })).toHaveCount(0);
});
