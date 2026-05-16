import { cn } from "@/lib/utils";

function Shimmer({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} />;
}

/**
 * Loading skeleton aligned with admin SaaS list pages (optional KPI strip + table chrome).
 */
export function AdminListSkeleton({
  statCards = 6,
  tableRows = 8,
  className,
}: {
  statCards?: number;
  tableRows?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-5", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Shimmer className="h-8 w-56 max-w-full" />
          <Shimmer className="h-4 w-40 max-w-full" />
        </div>
        <Shimmer className="h-10 w-36 rounded-xl" />
      </div>

      <Shimmer className="h-24 w-full rounded-2xl" />

      {statCards > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: statCards }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border/50 bg-card p-4 shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.05]"
            >
              <Shimmer className="mb-3 h-3 w-20" />
              <Shimmer className="h-8 w-14" />
            </div>
          ))}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
        <div className="flex gap-4 border-b bg-muted/45 px-5 py-3.5">
          <Shimmer className="h-3 w-20" />
          <Shimmer className="h-3 w-28" />
          <Shimmer className="h-3 w-24" />
          <Shimmer className="h-3 w-16" />
          <Shimmer className="h-3 w-20" />
          <Shimmer className="h-3 w-14" />
          <Shimmer className="h-3 w-12" />
        </div>
        {Array.from({ length: tableRows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-border/40 px-5 py-4 last:border-0">
            <Shimmer className="h-4 w-24" />
            <Shimmer className="h-4 flex-1 max-w-md" />
            <Shimmer className="h-6 w-20 rounded-full" />
            <Shimmer className="h-4 w-16" />
            <Shimmer className="h-4 w-20" />
            <Shimmer className="h-8 w-8 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
