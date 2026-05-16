import { SkeletonPageHeader } from "@/components/shared/skeleton-card";

export default function Loading() {
  return (
    <div className="space-y-6">
      <SkeletonPageHeader />
      <div className="sticky top-14 z-20 h-24 animate-pulse rounded-2xl bg-muted/40" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted/40" />
        ))}
      </div>
      <div className="h-80 animate-pulse rounded-2xl bg-muted/30" />
      <div className="h-80 animate-pulse rounded-2xl bg-muted/30" />
    </div>
  );
}
