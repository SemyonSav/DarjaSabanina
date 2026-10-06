"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { checkCredentials, startSession } from "@/lib/auth";
import {
  loginBlockedMinutes,
  registerLoginFailure,
  resetLoginFailures,
} from "@/lib/auth/rate-limit";

export interface LoginState {
  error?: string;
  /** Введённый логин — форма после действия сбрасывается, возвращаем его */
  login?: string;
}

/** Только внутренние адреса админки — защита от открытого редиректа */
function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/admin") && !next.startsWith("/admin/login")
    ? next
    : "/admin";
}

async function clientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown"
  );
}

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const loginValue = String(formData.get("login") ?? "").trim();
  const ip = await clientIp();
  const blocked = loginBlockedMinutes(ip);
  if (blocked) {
    return {
      error: `Слишком много попыток. Попробуйте через ${blocked} мин.`,
      login: loginValue,
    };
  }

  const password = String(formData.get("password") ?? "");

  if (!loginValue || !password || !(await checkCredentials(loginValue, password))) {
    registerLoginFailure(ip);
    return { error: "Неверный логин или пароль", login: loginValue };
  }

  resetLoginFailures(ip);
  await startSession(loginValue);
  redirect(safeNext(formData.get("next")));
}
