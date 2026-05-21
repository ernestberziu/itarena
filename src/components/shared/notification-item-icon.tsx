import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

export function NotificationItemIcon({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100",
        className
      )}
      aria-hidden
    >
      <Bell className="h-4 w-4 text-amber-500" strokeWidth={2} />
    </div>
  );
}
