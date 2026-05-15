import { SkeletonTable, SkeletonPageHeader } from "@/components/shared/skeleton-card";

export default function Loading() {
  return (
    <div className="space-y-5">
      <SkeletonPageHeader />
      <SkeletonTable />
    </div>
  );
}
