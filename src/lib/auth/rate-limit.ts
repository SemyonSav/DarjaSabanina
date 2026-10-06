/**
 * Ограничение попыток входа по IP. Хранится в памяти процесса —
 * приложение работает в одном экземпляре, этого достаточно.
 */

const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;

interface Entry {
  failures: number;
  resetAt: number;
}

const attempts = new Map<string, Entry>();

function current(ip: string): Entry | undefined {
  const entry = attempts.get(ip);
  if (entry && entry.resetAt <= Date.now()) {
    attempts.delete(ip);
    return undefined;
  }
  return entry;
}

/** Сколько минут ждать до следующей попытки; 0 — можно пробовать */
export function loginBlockedMinutes(ip: string): number {
  const entry = current(ip);
  if (!entry || entry.failures < MAX_FAILURES) return 0;
  return Math.ceil((entry.resetAt - Date.now()) / 60000);
}

export function registerLoginFailure(ip: string): void {
  const entry = current(ip);
  if (entry) {
    entry.failures++;
  } else {
    attempts.set(ip, { failures: 1, resetAt: Date.now() + WINDOW_MS });
  }
}

export function resetLoginFailures(ip: string): void {
  attempts.delete(ip);
}
