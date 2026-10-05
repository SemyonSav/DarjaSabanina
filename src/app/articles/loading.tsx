import { ArticleCardSkeleton } from "@/components/ui/Skeleton";
import { Container } from "@/components/ui/Container";

export default function ArticlesLoading() {
  return (
    <Container className="py-16 md:py-24">
      <div className="mb-12 space-y-4">
        <div className="h-4 w-20 animate-pulse rounded bg-sand" />
        <div className="h-12 w-48 animate-pulse rounded-2xl bg-sand" />
        <div className="h-6 w-96 max-w-full animate-pulse rounded-xl bg-sand" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <ArticleCardSkeleton key={i} />
        ))}
      </div>
    </Container>
  );
}
