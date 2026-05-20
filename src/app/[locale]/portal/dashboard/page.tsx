import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Ticket,
  ShoppingBag,
  FileText,
  Bell,
  Plus,
  ArrowRight,
  FolderKanban,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared/stat-card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { TicketStatusBadge } from "@/components/portal/ticket-status-badge";
import { PriorityBadge } from "@/components/portal/priority-badge";
import { PortalNotificationItem } from "@/components/portal/portal-notification-item";
import type { TicketStatus, Priority } from "@/types/domain";
import { timeAgo, formatPrice } from "@/lib/utils";
import { getTranslations } from "next-intl/server";
import {
  portalTicketWhere,
  portalOrderWhere,
  portalQuoteWhere,
  portalNotificationWhere,
  portalUsesCompanyScope,
  portalProjectClientWhere,
} from "@/lib/portal/scope";
import { portalUser } from "@/lib/portal/access";
import { resolveClientFacingTicketStatus } from "@/lib/ticket-activity";
import { portalTicketOpenedByLabel } from "@/lib/portal/client-branding";
import { projectStatusLabel } from "@/lib/projects/status-ui";
import type { ProjectStatus } from "@/lib/projects/types";

export default async function PortalDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/hyr");

  const { locale } = await params;
  const lp = locale === "sq" ? "" : `/${locale}`;
  const t = await getTranslations("portal");
  const user = portalUser(session);
  const companyScope = portalUsesCompanyScope(user);

  const ticketWhere = portalTicketWhere(user);
  const orderWhere = portalOrderWhere(user);
  const quoteWhere = portalQuoteWhere(user);

  const [
    openTickets,
    resolvedTickets,
    recentTickets,
    recentOrders,
    unreadNotifications,
    pendingQuotes,
    recentNotifications,
    projectCount,
    activeProjects,
  ] = await Promise.all([
    db.ticket.count({
      where: { ...ticketWhere, status: { notIn: ["RESOLVED", "CLOSED"] } },
    }),
    db.ticket.count({ where: { ...ticketWhere, status: "RESOLVED" } }),
    db.ticket.findMany({
      where: ticketWhere,
      orderBy: { updatedAt: "desc" },
      take: 6,
      select: {
        id: true,
        number: true,
        title: true,
        status: true,
        priority: true,
        updatedAt: true,
        createdBy: { select: { firstName: true, lastName: true, role: true } },
        history: {
          where: { field: "status" },
          orderBy: { createdAt: "asc" },
          select: { field: true, newValue: true, createdAt: true },
        },
      },
    }),
    db.order.findMany({
      where: orderWhere,
      orderBy: { createdAt: "desc" },
      take: 4,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        createdAt: true,
        user: { select: { firstName: true, lastName: true } },
      },
    }),
    db.notification.count({
      where: { ...portalNotificationWhere(session.user.id), readAt: null },
    }),
    companyScope
      ? db.quote.count({ where: { ...quoteWhere, status: { in: ["PENDING", "SENT"] } } })
      : Promise.resolve(0),
    db.notification.findMany({
      where: portalNotificationWhere(session.user.id),
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        type: true,
        title: true,
        body: true,
        link: true,
        readAt: true,
        createdAt: true,
      },
    }),
    db.projectClient.count({ where: portalProjectClientWhere(user) }),
    db.projectClient.findMany({
      where: portalProjectClientWhere(user),
      take: 3,
      include: { project: { select: { id: true, title: true, status: true } } },
    }),
  ]);

  const firstName = session.user.name?.split(" ")[0] ?? "Klient";

  const kpis = [
    {
      title: locale === "sq" ? "Bileta Aktive" : "Active Tickets",
      value: openTickets,
      icon: Ticket,
      href: `${lp}/portal/tickets`,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50 dark:bg-blue-950/40",
    },
    {
      title: locale === "sq" ? "Zgjidhur" : "Resolved",
      value: resolvedTickets,
      icon: Ticket,
      href: `${lp}/portal/tickets?status=RESOLVED`,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/40",
    },
    {
      title: t("notifications"),
      value: unreadNotifications,
      icon: Bell,
      href: `${lp}/portal/notifications`,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-50 dark:bg-amber-950/40",
    },
    ...(companyScope
      ? [
          {
            title: locale === "sq" ? "Oferta" : "Quotes",
            value: pendingQuotes,
            icon: FileText,
            href: `${lp}/portal/quotes`,
            iconColor: "text-purple-600",
            iconBg: "bg-purple-50 dark:bg-purple-950/40",
          },
        ]
      : []),
  ];

  const ORDER_STATUS_LABELS: Record<string, { sq: string; en: string; color: string }> = {
    PLACED: { sq: "Vendosur", en: "Placed", color: "text-amber-600 bg-amber-50" },
    CONFIRMED: { sq: "Konfirmuar", en: "Confirmed", color: "text-blue-600 bg-blue-50" },
    DISPATCHED: { sq: "Dërguar", en: "Dispatched", color: "text-indigo-600 bg-indigo-50" },
    DELIVERED: { sq: "Dorëzuar", en: "Delivered", color: "text-emerald-600 bg-emerald-50" },
    CANCELLED: { sq: "Anuluar", en: "Cancelled", color: "text-red-600 bg-red-50" },
  };

  const seenProjects = new Set<string>();
  const uniqueProjects = activeProjects
    .map((l) => l.project)
    .filter((p) => {
      if (seenProjects.has(p.id)) return false;
      seenProjects.add(p.id);
      return true;
    });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={locale === "sq" ? `Mirëdita, ${firstName}!` : `Hello, ${firstName}!`}
        description={
          companyScope
            ? t("company_scope_hint")
            : locale === "sq"
              ? "Ky është paneli juaj i mbështetjes IT."
              : "This is your IT support dashboard."
        }
        actions={
          <Button asChild size="sm">
            <Link href={`${lp}/portal/tickets/new`}>
              <Plus className="h-4 w-4 mr-1.5" strokeWidth={2} />
              {t("new_ticket")}
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((k) => (
          <StatCard key={k.title} {...k} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 admin-card-elevated">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-3">
            <CardTitle className="text-sm font-semibold">{t("my_tickets")}</CardTitle>
            <Link
              href={`${lp}/portal/tickets`}
              className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
            >
              {locale === "sq" ? "Shiko të gjitha" : "View all"}
              <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {recentTickets.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-muted-foreground">
                <Ticket className="h-8 w-8 mb-3 opacity-25" strokeWidth={1.5} />
                <p className="text-sm">{locale === "sq" ? "Nuk keni bileta ende." : "No tickets yet."}</p>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {recentTickets.map((ticket) => (
                  <Link
                    key={ticket.id}
                    href={`${lp}/portal/tickets/${ticket.id}`}
                    className="group flex items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/35"
                  >
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-muted-foreground">{ticket.number}</span>
                        <PriorityBadge priority={ticket.priority as Priority} locale={locale} />
                      </div>
                      <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                        {ticket.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("opened_by")}:{" "}
                        {portalTicketOpenedByLabel(
                          ticket.createdBy,
                          locale === "en" ? "en" : "sq"
                        )}
                      </p>
                    </div>
                    <TicketStatusBadge
                      status={resolveClientFacingTicketStatus(
                        ticket.status as TicketStatus,
                        ticket.history
                      )}
                      locale={locale}
                    />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="admin-card-elevated">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Bell className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
                {t("notifications")}
              </CardTitle>
              <Link href={`${lp}/portal/notifications`} className="text-xs font-medium text-primary hover:underline">
                {locale === "sq" ? "Të gjitha" : "All"}
              </Link>
            </CardHeader>
            <CardContent className="divide-y divide-border/60 p-0">
              {recentNotifications.length === 0 ? (
                <p className="py-8 text-center text-xs text-muted-foreground">
                  {locale === "sq" ? "Nuk ka njoftime" : "No notifications"}
                </p>
              ) : (
                recentNotifications.map((n) => (
                  <PortalNotificationItem key={n.id} notification={n} locale={locale} lp={lp} variant="feed" />
                ))
              )}
            </CardContent>
          </Card>

          {projectCount > 0 ? (
            <Card className="admin-card-elevated">
              <CardHeader className="flex flex-row items-center justify-between border-b pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <FolderKanban className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
                  {t("projects")}
                </CardTitle>
                <Link href={`${lp}/portal/projects`} className="text-xs font-medium text-primary hover:underline">
                  {locale === "sq" ? "Të gjitha" : "All"}
                </Link>
              </CardHeader>
              <CardContent className="divide-y divide-border/60 p-0">
                {uniqueProjects.map((p) => (
                  <Link
                    key={p.id}
                    href={`${lp}/portal/projects/${p.id}`}
                    className="block px-4 py-3 transition-colors hover:bg-muted/35"
                  >
                    <p className="text-sm font-medium">{p.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {projectStatusLabel(p.status as ProjectStatus, locale)}
                    </p>
                  </Link>
                ))}
              </CardContent>
            </Card>
          ) : null}

          {recentOrders.length > 0 ? (
            <Card className="admin-card-elevated">
              <CardHeader className="flex flex-row items-center justify-between border-b pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
                  {locale === "sq" ? "Porosi Recente" : "Recent Orders"}
                </CardTitle>
                <Link href={`${lp}/portal/orders`} className="text-xs font-medium text-primary hover:underline">
                  {locale === "sq" ? "Të gjitha" : "All"}
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/60">
                  {recentOrders.map((order) => {
                    const sl = ORDER_STATUS_LABELS[order.status];
                    return (
                      <div key={order.id} className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-muted/35">
                        <div>
                          <p className="text-xs font-mono text-muted-foreground">{order.orderNumber}</p>
                          <p className="text-sm font-semibold tabular-nums">{formatPrice(Number(order.total))}</p>
                          {companyScope ? (
                            <p className="text-xs text-muted-foreground">
                              {order.user.firstName} {order.user.lastName}
                            </p>
                          ) : null}
                        </div>
                        {sl ? (
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sl.color}`}>
                            {sl[locale as "sq" | "en"]}
                          </span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
