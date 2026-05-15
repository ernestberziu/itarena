import { SkeletonTable, SkeletonPageHeader } from "@/components/shared/skeleton-card";

export default function Loading() {
  return (
    <div className="space-y-6">
      <SkeletonPageHeader />
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="h-[4.5rem] animate-pulse rounded-xl border border-border/40 bg-muted/30" />
        <div className="h-[4.5rem] animate-pulse rounded-xl border border-border/40 bg-muted/30" />
        <div className="h-[4.5rem] animate-pulse rounded-xl border border-border/40 bg-muted/30" />
      </div>
      <div className="h-36 animate-pulse rounded-2xl border border-border/40 bg-muted/25" />
      <SkeletonTable />
    </div>
  );
}
