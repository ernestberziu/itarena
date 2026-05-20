"use client";

import { useRouter } from "next/navigation";
import { timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";

const TYPE_ICONS: Record<string, string> = {
  TICKET: "🎫",
  ORDER: "📦",
  QUOTE: "📄",
  PROJECT: "📁",
  SYSTEM: "🔔",
};

export function PortalNotificationItem({
  notification,
  locale,
  lp,
  variant = "list",
}: {
  notification: {
    id: string;
    title: string;
    body: string;
    link: string | null;
    readAt: Date | string | null;
    createdAt: Date | string;
    type: string;
  };
  locale: string;
  lp: string;
  /** `list` = full notifications page; `feed` = compact dashboard widget */
  variant?: "list" | "feed";
}) {
  const router = useRouter();
  const unread = !notification.readAt;

  async function markReadAndNavigate(href: string) {
    if (unread) {
      await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: notification.id }),
      }).catch(() => undefined);
    }
    router.push(href);
  }

  const resolvedLink = notification.link
    ? notification.link.startsWith("/")
      ? notification.link.startsWith(`/${locale}`) || lp === ""
        ? notification.link
        : `${lp}${notification.link.replace(/^\/en/, "")}`
      : notification.link
    : null;

  const rowClass = cn(
    "flex w-full items-start gap-4 text-left transition-colors",
    variant === "list" ? "px-5 py-4" : "px-4 py-3",
    unread ? "bg-primary/[0.04] hover:bg-primary/[0.06]" : "hover:bg-muted/35"
  );

  const content = (
    <>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-base">
        {TYPE_ICONS[notification.type] ?? "🔔"}
      </div>
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className={cn("text-sm", unread ? "font-semibold" : "font-medium")}>{notification.title}</p>
        {notification.body ? (
          <p className={cn("text-xs text-muted-foreground", variant === "feed" && "line-clamp-2")}>
            {notification.body}
          </p>
        ) : null}
        <p className="text-[10px] text-muted-foreground/70">{timeAgo(notification.createdAt)}</p>
      </div>
      {unread ? <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" /> : null}
    </>
  );

  if (resolvedLink) {
    return (
      <button type="button" onClick={() => void markReadAndNavigate(resolvedLink)} className={rowClass}>
        {content}
      </button>
    );
  }

  return <div className={rowClass}>{content}</div>;
}
