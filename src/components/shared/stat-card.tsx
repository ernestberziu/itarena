import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  href?: string;
  delta?: {
    value: string | number;
    positive?: boolean;
    label?: string;
  };
  iconColor?: string;
  iconBg?: string;
  className?: string;
}

function StatCardInner({
  title,
  value,
  icon: Icon,
  delta,
  iconColor = "text-primary",
  iconBg = "bg-primary/10",
}: StatCardProps) {
  return (
    <div className="flex flex-col gap-3 p-5 h-full">
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 flex-1 text-sm font-medium leading-snug text-muted-foreground">
          {title}
        </p>
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            iconBg
          )}
        >
          <Icon className={cn("h-4 w-4", iconColor)} strokeWidth={2} />
        </div>
      </div>
      <div>
        <p className="admin-stat-value text-lg font-bold tabular-nums leading-snug text-foreground">
          {value}
        </p>
        {delta && (
          <div
            className={cn(
              "flex items-center gap-1 mt-1 text-xs font-medium",
              delta.positive ? "text-emerald-600" : "text-red-500"
            )}
          >
            {delta.positive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>
              {delta.value}
              {delta.label && (
                <span className="ml-1 font-normal text-muted-foreground">
                  {delta.label}
                </span>
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function StatCard(props: StatCardProps) {
  const inner = <StatCardInner {...props} />;
  const base =
    "group relative overflow-hidden rounded-[var(--admin-card-radius)] transition-all duration-200 border border-border/80 bg-card shadow-sm ring-1 ring-foreground/5 hover:shadow-md hover:ring-primary/20";

  if (props.href) {
    return (
      <Link href={props.href} data-slot="stat-card" className={cn(base, "block", props.className)}>
        {inner}
      </Link>
    );
  }

  return (
    <div data-slot="stat-card" className={cn(base, props.className)}>
      {inner}
    </div>
  );
}
