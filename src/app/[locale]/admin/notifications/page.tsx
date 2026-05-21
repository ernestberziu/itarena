import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Bell } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { MarkAllReadButton } from "@/components/portal/mark-all-read-button";
import { PortalNotificationItem } from "@/components/portal/portal-notification-item";
import { getCachedEffectiveAcl } from "@/lib/admin-acl/cached-user-acl";
import { requireAdminPageRead } from "@/lib/admin-acl/page-guard";

export default async function AdminNotificationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/hyr");

  const { locale } = await params;
  const acl = await getCachedEffectiveAcl(session.user.id);
  if (!acl) redirect("/hyr");
  requireAdminPageRead(locale, acl, "notifications");

  const lp = locale === "sq" ? "" : `/${locale}`;
  const en = locale === "en";

  const notifications = await db.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 80,
    select: {
      id: true,
      type: true,
      category: true,
      severity: true,
      title: true,
      titleEn: true,
      body: true,
      bodyEn: true,
      link: true,
      readAt: true,
      createdAt: true,
    },
  });

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const items = notifications.map((n) => ({
    id: n.id,
    type: n.type,
    category: n.category,
    severity: n.severity,
    title: en && n.titleEn ? n.titleEn : n.title,
    body: en && n.bodyEn ? n.bodyEn : n.body,
    link: n.link,
    readAt: n.readAt,
    createdAt: n.createdAt,
  }));

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title={en ? "Notifications" : "Njoftimet"}
        description={`${unreadCount} ${en ? "unread" : "të palexuara"}`}
        actions={unreadCount > 0 ? <MarkAllReadButton locale={locale} /> : null}
      />

      {items.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={en ? "No notifications" : "Nuk ka njoftime"}
          description={
            en ? "Activity will appear here." : "Kur të ketë aktivitet, do të shfaqet këtu."
          }
        />
      ) : (
        <div className="admin-card-elevated overflow-hidden rounded-2xl">
          <div className="divide-y divide-border/60">
            {items.map((n) => (
              <PortalNotificationItem
                key={n.id}
                notification={n}
                locale={locale}
                lp={lp}
                variant="list"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
