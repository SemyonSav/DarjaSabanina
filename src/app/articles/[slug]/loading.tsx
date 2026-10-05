import { ArticleCardSkeleton } from "@/components/ui/Skeleton";
import { Container } from "@/components/ui/Container";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ArticleLoading() {
  return (
    <Container className="py-14 md:py-20">
      <div className="mx-auto max-w-3xl space-y-6">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="aspect-[16/10] w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      <div className="mt-20 grid gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <ArticleCardSkeleton key={i} />
        ))}
      </div>
    </Container>
  );
}
