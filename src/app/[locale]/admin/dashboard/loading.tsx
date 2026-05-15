import { SkeletonStatGrid, SkeletonTable, SkeletonPageHeader, Skeleton } from "@/components/shared/skeleton-card";

export default function Loading() {
  return (
    <div className="space-y-6">
      <SkeletonPageHeader />
      <SkeletonStatGrid count={7} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl border bg-card p-5">
          <Skeleton className="h-4 w-40 mb-4" />
          <Skeleton className="h-48 w-full" />
        </div>
        <div className="rounded-xl border bg-card p-5">
          <Skeleton className="h-4 w-32 mb-4" />
          <Skeleton className="h-28 w-28 rounded-full mx-auto" />
        </div>
      </div>
      <SkeletonTable />
    </div>
  );
}
