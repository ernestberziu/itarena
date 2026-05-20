import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS } from "@/lib/admin-order-status";

export function OrderStatusBadge({
  status,
  locale,
  className,
}: {
  status: string;
  locale: string;
  className?: string;
}) {
  const en = locale === "en";
  const sl = STATUS_LABELS[status];

  if (!sl) {
    return (
      <Badge variant="outline" className={cn("font-mono text-xs", className)}>
        {status}
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className={cn("border font-medium text-xs shadow-none", sl.color, className)}>
      {en ? sl.en : sl.sq}
    </Badge>
  );
}
