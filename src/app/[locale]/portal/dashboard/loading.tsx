import { SkeletonStatGrid, SkeletonTable, SkeletonPageHeader } from "@/components/shared/skeleton-card";

export default function Loading() {
  return (
    <div className="space-y-6">
      <SkeletonPageHeader />
      <SkeletonStatGrid count={4} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <SkeletonTable rows={5} />
        </div>
        <div>
          <SkeletonTable rows={4} />
        </div>
      </div>
    </div>
  );
}
