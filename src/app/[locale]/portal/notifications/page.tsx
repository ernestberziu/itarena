import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Bell } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { MarkAllReadButton } from "@/components/portal/mark-all-read-button";
import { PortalNotificationItem } from "@/components/portal/portal-notification-item";
import { portalNotificationWhere } from "@/lib/portal/scope";

export default async function NotificationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/hyr");

  const { locale } = await params;
  const lp = locale === "sq" ? "" : `/${locale}`;

  const notifications = await db.notification.findMany({
    where: portalNotificationWhere(session.user.id),
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title={locale === "sq" ? "Njoftimet" : "Notifications"}
        description={`${unreadCount} ${locale === "sq" ? "të palexuara" : "unread"}`}
        actions={unreadCount > 0 ? <MarkAllReadButton locale={locale} /> : null}
      />

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={locale === "sq" ? "Nuk ka njoftime" : "No notifications"}
          description={
            locale === "sq" ? "Kur të ketë aktivitet, do të shfaqet këtu." : "Activity will appear here."
          }
        />
      ) : (
        <div className="admin-card-elevated overflow-hidden rounded-2xl">
          <div className="divide-y divide-border/60">
            {notifications.map((n) => (
              <PortalNotificationItem key={n.id} notification={n} locale={locale} lp={lp} variant="list" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
