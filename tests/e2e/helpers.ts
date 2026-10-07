import { expect, type Page } from "@playwright/test";
import { E2E_LOGIN, E2E_PASSWORD } from "./credentials";

export async function login(page: Page, next = "/admin/articles") {
  await page.goto(next);
  await page.getByLabel("Логин").fill(E2E_LOGIN);
  await page.getByLabel("Пароль").fill(E2E_PASSWORD);
  await page.getByRole("button", { name: "Войти" }).click();
  await expect(page).toHaveURL(new RegExp(`${next}$`));
}
