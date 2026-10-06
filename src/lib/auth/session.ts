import { SignJWT, jwtVerify } from "jose";

/**
 * Подписанная сессия администратора. Модуль без Node-зависимостей,
 * поэтому работает и в middleware (Edge), и на сервере.
 */

export const SESSION_COOKIE = "admin_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 дней

export interface SessionPayload {
  login: string;
}

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET не задан или короче 32 символов");
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ login: payload.login })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret());
}

export async function verifySession(
  token: string | undefined,
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: ["HS256"],
    });
    return typeof payload.login === "string" ? { login: payload.login } : null;
  } catch {
    return null;
  }
}
