"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { login, type LoginState } from "./actions";

const inputClass =
  "h-12 w-full rounded-[1.1rem] border border-border bg-background px-4 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(
    login,
    {},
  );

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next ?? ""} />
      <label className="block space-y-2">
        <span className="text-sm text-muted-foreground">Логин</span>
        <input
          name="login"
          required
          autoComplete="username"
          autoFocus
          className={inputClass}
        />
      </label>
      <label className="block space-y-2">
        <span className="text-sm text-muted-foreground">Пароль</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
        />
      </label>
      {state.error ? (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Входим…" : "Войти"}
      </Button>
    </form>
  );
}
