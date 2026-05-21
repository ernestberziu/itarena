import Link from "next/link";
import { Bell } from "lucide-react";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PortalNotificationItem } from "@/components/portal/portal-notification-item";

export async function AdminDashboardNotifications({
  userId,
  locale,
  lp,
  title,
}: {
  userId: string;
  locale: string;
  lp: string;
  title: string;
}) {
  const en = locale === "en";

  const [unreadCount, recentNotifications] = await Promise.all([
    db.notification.count({
      where: { userId, readAt: null },
    }),
    db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 6,
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
    }),
  ]);

  const items = recentNotifications.map((n) => ({
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
    <Card className="admin-card-elevated">
      <CardHeader className="flex flex-row items-center justify-between border-b pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Bell className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
          {title}
          {unreadCount > 0 ? (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold tabular-nums text-amber-700">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          ) : null}
        </CardTitle>
        <Link
          href={`${lp}/admin/notifications`}
          className="text-xs font-medium text-primary hover:underline"
        >
          {en ? "View all" : "Të gjitha"}
        </Link>
      </CardHeader>
      <CardContent className="divide-y divide-border/60 p-0">
        {items.length === 0 ? (
          <p className="py-8 text-center text-xs text-muted-foreground">
            {en ? "No notifications" : "Nuk ka njoftime"}
          </p>
        ) : (
          items.map((n) => (
            <PortalNotificationItem
              key={n.id}
              notification={n}
              locale={locale}
              lp={lp}
              variant="feed"
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}
