import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-[1.25rem] bg-sand/70 dark:bg-muted",
        className,
      )}
    />
  );
}

export function ArticleCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-border bg-card">
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <div className="space-y-3 p-6">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-7 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="mt-4 h-10 w-28" />
      </div>
    </div>
  );
}
