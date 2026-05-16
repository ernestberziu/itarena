import { SkeletonPageHeader, SkeletonStatGrid, SkeletonTable } from "@/components/shared/skeleton-card";

export default function Loading() {
  return (
    <div className="space-y-6">
      <SkeletonPageHeader />
      <SkeletonStatGrid count={3} />
      <SkeletonTable rows={4} />
    </div>
  );
}
