import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Bell } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { MarkAllReadButton } from "@/components/portal/mark-all-read-button";
import { timeAgo } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getCachedEffectiveAcl } from "@/lib/admin-acl/cached-user-acl";
import { requireAdminPageRead } from "@/lib/admin-acl/page-guard";

const TYPE_ICONS: Record<string, string> = {
  TICKET_UPDATE: "🎫",
  TICKET_COMMENT: "💬",
  ORDER_UPDATE: "📦",
  QUOTE_RECEIVED: "📄",
  SYSTEM: "🔔",
};

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

  const notifications = await db.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 80,
  });

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  function titleFor(n: (typeof notifications)[0]) {
    if (locale === "en" && n.titleEn) return n.titleEn;
    return n.title;
  }

  function bodyFor(n: (typeof notifications)[0]) {
    if (locale === "en" && n.bodyEn) return n.bodyEn;
    return n.body;
  }

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
              <div
                key={n.id}
                className={`flex items-start gap-4 px-5 py-4 transition-colors ${
                  !n.readAt ? "bg-primary/[0.04] hover:bg-primary/[0.06]" : "hover:bg-muted/30"
                }`}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-base">
                  {TYPE_ICONS[n.type] ?? "🔔"}
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className={`text-sm ${!n.readAt ? "font-semibold" : "font-medium"}`}>{titleFor(n)}</p>
                  {bodyFor(n) && <p className="text-xs text-muted-foreground">{bodyFor(n)}</p>}
                  <p className="text-[10px] text-muted-foreground/70">{timeAgo(n.createdAt)}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  {!n.readAt && <div className="mt-1 h-2 w-2 rounded-full bg-primary" />}
                  {n.link && (
                    <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
                      <Link
                        href={
                          n.link.startsWith("http")
                            ? n.link
                            : `${lp}${n.link.startsWith("/") ? n.link : `/${n.link}`}`
                        }
                      >
                        {locale === "sq" ? "Hap" : "Open"}
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
