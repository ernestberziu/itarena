import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <Skeleton className="h-7 w-16" />
    </div>
  );
}

function SkeletonStatGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

function SkeletonTableRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b last:border-0">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 flex-1" />
      <Skeleton className="h-5 w-16 rounded-full" />
      <Skeleton className="h-5 w-14 rounded-full" />
      <Skeleton className="h-4 w-20" />
    </div>
  );
}

function SkeletonTable({ rows = 6 }: { rows?: number }) {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      {/* header */}
      <div className="flex items-center gap-4 px-4 py-3 border-b bg-muted/30">
        {[28, 40, 16, 16, 20].map((w, i) => (
          <Skeleton key={i} className={`h-3 w-${w}`} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonTableRow key={i} />
      ))}
    </div>
  );
}

function SkeletonPageHeader() {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="h-9 w-32 rounded-lg" />
    </div>
  );
}

export {
  Skeleton,
  SkeletonCard,
  SkeletonStatGrid,
  SkeletonTableRow,
  SkeletonTable,
  SkeletonPageHeader,
};
