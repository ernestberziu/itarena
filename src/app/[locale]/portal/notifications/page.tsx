import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { MarkAllReadButton } from "@/components/portal/mark-all-read-button";
import { timeAgo } from "@/lib/utils";

const TYPE_ICONS: Record<string, string> = {
  TICKET_UPDATE: "🎫",
  TICKET_COMMENT: "💬",
  ORDER_UPDATE: "📦",
  QUOTE_RECEIVED: "📄",
  SYSTEM: "🔔",
};

export default async function NotificationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/hyr");

  const { locale } = await params;

  const notifications = await db.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <div className="space-y-5">
      <PageHeader
        title={locale === "sq" ? "Njoftimet" : "Notifications"}
        description={`${unreadCount} ${locale === "sq" ? "të palexuara" : "unread"}`}
        actions={
          unreadCount > 0 ? (
            <MarkAllReadButton locale={locale} />
          ) : null
        }
      />

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={locale === "sq" ? "Nuk ka njoftime" : "No notifications"}
          description={locale === "sq" ? "Kur të ketë aktivitet, do të shfaqet këtu." : "Activity will appear here."}
        />
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="divide-y">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`flex items-start gap-4 px-5 py-4 transition-colors ${
                  !n.readAt ? "bg-primary/5 hover:bg-primary/8" : "hover:bg-muted/30"
                }`}
              >
                <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0 text-base">
                  {TYPE_ICONS[n.type] ?? "🔔"}
                </div>
                <div className="flex-1 min-w-0 space-y-0.5">
                  <p className={`text-sm ${!n.readAt ? "font-semibold" : "font-medium"}`}>
                    {n.title}
                  </p>
                  {n.body && (
                    <p className="text-xs text-muted-foreground">{n.body}</p>
                  )}
                  <p className="text-[10px] text-muted-foreground/60">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.readAt && (
                  <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
