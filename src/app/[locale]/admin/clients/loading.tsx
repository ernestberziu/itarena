import { SkeletonTable, SkeletonPageHeader, SkeletonStatGrid } from "@/components/shared/skeleton-card";

export default function Loading() {
  return (
    <div className="space-y-6">
      <SkeletonPageHeader />
      <SkeletonStatGrid count={4} />
      <SkeletonTable rows={8} />
    </div>
  );
}
