import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS } from "@/lib/admin-quote-status";
import { isQuoteExpired } from "@/lib/quote-display";

export function QuoteStatusBadge({
  status,
  locale,
  validUntil,
  className,
}: {
  status: string;
  locale: string;
  validUntil?: string | null;
  className?: string;
}) {
  const en = locale === "en";
  const sl = STATUS_LABELS[status];
  const expired = isQuoteExpired({ validUntil, status });

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {sl ? (
        <Badge variant="outline" className={cn("border font-medium text-xs shadow-none", sl.color)}>
          {en ? sl.en : sl.sq}
        </Badge>
      ) : (
        <Badge variant="outline" className="text-xs font-mono">
          {status}
        </Badge>
      )}
      {expired ? (
        <Badge
          variant="outline"
          className="border border-rose-200 bg-rose-50 text-xs font-medium text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
        >
          {en ? "Expired" : "Skaduar"}
        </Badge>
      ) : null}
    </div>
  );
}
