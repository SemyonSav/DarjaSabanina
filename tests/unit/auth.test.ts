import { describe, expect, it, vi } from "vitest";
import { signSession, verifySession } from "@/lib/auth/session";
import {
  loginBlockedMinutes,
  registerLoginFailure,
  resetLoginFailures,
} from "@/lib/auth/rate-limit";

describe("сессия администратора", () => {
  it("подписывается и проверяется", async () => {
    const token = await signSession({ login: "admin" });
    expect(await verifySession(token)).toEqual({ login: "admin" });
  });

  it("отклоняет подделанный и пустой токен", async () => {
    const token = await signSession({ login: "admin" });
    const [header, , signature] = token.split(".");
    const forged = Buffer.from(JSON.stringify({ login: "hacker" })).toString(
      "base64url",
    );
    expect(await verifySession(`${header}.${forged}.${signature}`)).toBeNull();
    expect(await verifySession("мусор")).toBeNull();
    expect(await verifySession(undefined)).toBeNull();
  });

  it("отклоняет токен, подписанный другим секретом", async () => {
    const token = await signSession({ login: "admin" });
    vi.stubEnv("AUTH_SECRET", "another-secret-another-secret-123456");
    expect(await verifySession(token)).toBeNull();
    vi.unstubAllEnvs();
  });
});

describe("ограничение попыток входа", () => {
  it("блокирует после 5 неудач и сбрасывается после успеха", () => {
    const ip = "203.0.113.7";
    for (let i = 0; i < 4; i++) registerLoginFailure(ip);
    expect(loginBlockedMinutes(ip)).toBe(0);
    registerLoginFailure(ip);
    expect(loginBlockedMinutes(ip)).toBeGreaterThan(0);
    resetLoginFailures(ip);
    expect(loginBlockedMinutes(ip)).toBe(0);
  });

  it("снимает блокировку через 15 минут", () => {
    vi.useFakeTimers();
    const ip = "203.0.113.8";
    for (let i = 0; i < 5; i++) registerLoginFailure(ip);
    expect(loginBlockedMinutes(ip)).toBe(15);
    vi.advanceTimersByTime(15 * 60 * 1000 + 1);
    expect(loginBlockedMinutes(ip)).toBe(0);
    vi.useRealTimers();
  });
});
