import "server-only";
import { timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  signSession,
  verifySession,
  type SessionPayload,
} from "./session";

/** Хеш хранится в env в base64, чтобы знаки `$` не ломали .env и docker */
function getPasswordHash(): string {
  const encoded = process.env.ADMIN_PASSWORD_HASH;
  if (!encoded) throw new Error("ADMIN_PASSWORD_HASH не задан");
  return Buffer.from(encoded, "base64").toString("utf8");
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function checkCredentials(
  login: string,
  password: string,
): Promise<boolean> {
  const expectedLogin = process.env.ADMIN_LOGIN || "admin";
  // Пароль проверяем всегда, чтобы время ответа не выдавало верный логин
  const passwordOk = await bcrypt.compare(password, getPasswordHash());
  return safeEqual(login, expectedLogin) && passwordOk;
}

export async function startSession(login: string): Promise<void> {
  const token = await signSession({ login });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function endSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  return verifySession((await cookies()).get(SESSION_COOKIE)?.value);
}

/**
 * Проверка в каждой странице и server action админки.
 * Middleware — только первый рубеж: server actions вызываются
 * POST-запросом и не должны полагаться на него.
 */
export async function requireAdmin(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}
