import { cn } from "@/lib/utils";

/** Общие стили и мелкие элементы интерфейса админки */

export const inputClass =
  "h-11 w-full rounded-[0.9rem] border border-border bg-background px-3.5 text-[0.95rem] outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:opacity-60";

export const textareaClass =
  "w-full rounded-[0.9rem] border border-border bg-background px-3.5 py-2.5 text-[0.95rem] leading-relaxed outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20";

export const cardClass =
  "rounded-[1.25rem] border border-border bg-card p-5 shadow-soft md:p-6";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="font-display text-3xl font-medium md:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}

export function Field({
  label,
  hint,
  error,
  htmlFor,
  className,
  children,
}: {
  label: string;
  hint?: React.ReactNode;
  error?: string;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="block text-sm font-medium">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "accent" | "warning";
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tone === "accent" && "bg-accent-soft text-accent",
        tone === "warning" &&
          "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
        tone === "neutral" && "bg-muted text-muted-foreground",
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[1.25rem] border border-dashed border-border bg-card/60 px-6 py-12 text-center text-muted-foreground">
      {children}
    </div>
  );
}
