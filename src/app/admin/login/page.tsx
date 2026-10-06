import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { siteConfig } from "@/lib/site";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Вход в админку",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  if (await getSession()) redirect("/admin");
  const { next } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-warm px-4 dark:bg-background">
      <div className="w-full max-w-sm rounded-[1.5rem] border border-border bg-card p-8 shadow-soft">
        <p className="text-sm font-medium tracking-[0.14em] uppercase text-accent">
          Админ-панель
        </p>
        <h1 className="mt-2 font-display text-3xl font-medium">
          {siteConfig.name}
        </h1>
        <div className="mt-8">
          <LoginForm next={next} />
        </div>
      </div>
    </div>
  );
}
