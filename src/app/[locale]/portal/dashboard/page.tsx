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
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared/stat-card";
import { TicketStatusBadge } from "@/components/portal/ticket-status-badge";
import { PriorityBadge } from "@/components/portal/priority-badge";
import type { TicketStatus, Priority } from "@/types/domain";
import { timeAgo, formatPrice } from "@/lib/utils";

export default async function PortalDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/hyr");

  const { locale } = await params;
  const lp = locale === "sq" ? "" : `/${locale}`;

  const [
    openTickets,
    totalTickets,
    resolvedTickets,
    recentTickets,
    recentOrders,
    unreadNotifications,
    pendingQuotes,
    recentNotifications,
  ] = await Promise.all([
    db.ticket.count({
      where: { createdById: session.user.id, status: { notIn: ["RESOLVED", "CLOSED"] } },
    }),
    db.ticket.count({ where: { createdById: session.user.id } }),
    db.ticket.count({ where: { createdById: session.user.id, status: "RESOLVED" } }),
    db.ticket.findMany({
      where: { createdById: session.user.id },
      orderBy: { updatedAt: "desc" },
      take: 6,
      select: {
        id: true,
        number: true,
        title: true,
        status: true,
        priority: true,
        slaDeadline: true,
        updatedAt: true,
      },
    }),
    db.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: { id: true, orderNumber: true, status: true, total: true, createdAt: true },
    }),
    db.notification.count({ where: { userId: session.user.id, readAt: null } }),
    db.quote.count({ where: { requestedById: session.user.id, status: "PENDING" } }),
    db.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { id: true, type: true, title: true, body: true, readAt: true, createdAt: true },
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
      icon: CheckCircle2,
      href: `${lp}/portal/tickets?status=RESOLVED`,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/40",
    },
    {
      title: locale === "sq" ? "Njoftime" : "Notifications",
      value: unreadNotifications,
      icon: Bell,
      href: `${lp}/portal/notifications`,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-50 dark:bg-amber-950/40",
    },
    {
      title: locale === "sq" ? "Oferta Pritëse" : "Pending Quotes",
      value: pendingQuotes,
      icon: FileText,
      href: `${lp}/portal/quotes`,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-50 dark:bg-purple-950/40",
    },
  ];

  const ORDER_STATUS_LABELS: Record<string, { sq: string; en: string; color: string }> = {
    PLACED: { sq: "Vendosur", en: "Placed", color: "text-amber-600 bg-amber-50" },
    CONFIRMED: { sq: "Konfirmuar", en: "Confirmed", color: "text-blue-600 bg-blue-50" },
    DISPATCHED: { sq: "Dërguar", en: "Dispatched", color: "text-indigo-600 bg-indigo-50" },
    DELIVERED: { sq: "Dorëzuar", en: "Delivered", color: "text-emerald-600 bg-emerald-50" },
    CANCELLED: { sq: "Anuluar", en: "Cancelled", color: "text-red-600 bg-red-50" },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {locale === "sq" ? `Mirëdita, ${firstName}!` : `Hello, ${firstName}!`}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {locale === "sq"
              ? "Ky është paneli juaj i mbështetjes IT."
              : "This is your IT support dashboard."}
          </p>
        </div>
        <Button asChild size="sm">
          <Link href={`${lp}/portal/tickets/new`}>
            <Plus className="h-4 w-4 mr-1.5" strokeWidth={2} />
            {locale === "sq" ? "Biletë e re" : "New Ticket"}
          </Link>
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((k) => <StatCard key={k.title} {...k} />)}
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Tickets */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3 flex flex-row items-center justify-between border-b">
            <CardTitle className="text-sm font-semibold">
              {locale === "sq" ? "Biletat e Mia" : "My Tickets"}
            </CardTitle>
            <Link href={`${lp}/portal/tickets`} className="text-xs text-primary hover:underline font-medium flex items-center gap-1">
              {locale === "sq" ? "Shiko të gjitha" : "View all"}
              <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {recentTickets.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-muted-foreground">
                <Ticket className="h-8 w-8 mb-3 opacity-25" strokeWidth={1.5} />
                <p className="text-sm">
                  {locale === "sq" ? "Nuk keni bileta ende." : "No tickets yet."}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {recentTickets.map((ticket) => (
                  <Link
                    key={ticket.id}
                    href={`${lp}/portal/tickets/${ticket.id}`}
                    className="group flex items-center gap-4 px-4 py-3 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-muted-foreground">{ticket.number}</span>
                        <PriorityBadge priority={ticket.priority as Priority} locale={locale} />
                      </div>
                      <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                        {ticket.title}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <TicketStatusBadge status={ticket.status as TicketStatus} locale={locale} />
                      <span className="text-[10px] text-muted-foreground">{timeAgo(ticket.updatedAt)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right column: Notifications + Recent Orders */}
        <div className="space-y-4">
          {/* Notifications feed */}
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Bell className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
                {locale === "sq" ? "Njoftime" : "Notifications"}
                {unreadNotifications > 0 && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold px-1">
                    {unreadNotifications > 9 ? "9+" : unreadNotifications}
                  </span>
                )}
              </CardTitle>
              <Link href={`${lp}/portal/notifications`} className="text-xs text-primary hover:underline font-medium">
                {locale === "sq" ? "Të gjitha" : "All"}
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {recentNotifications.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">
                  {locale === "sq" ? "Nuk ka njoftime" : "No notifications"}
                </p>
              ) : (
                <div className="divide-y">
                  {recentNotifications.map((n) => (
                    <div
                      key={n.id}
                      className={`px-4 py-3 space-y-0.5 ${!n.readAt ? "bg-primary/5" : ""}`}
                    >
                      <p className="text-xs font-medium truncate">{n.title}</p>
                      {n.body && (
                        <p className="text-xs text-muted-foreground truncate">{n.body}</p>
                      )}
                      <p className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
                        <Clock className="h-3 w-3" strokeWidth={2} />
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Orders */}
          {recentOrders.length > 0 && (
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between border-b">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
                  {locale === "sq" ? "Porosi Recente" : "Recent Orders"}
                </CardTitle>
                <Link href={`${lp}/portal/orders`} className="text-xs text-primary hover:underline font-medium">
                  {locale === "sq" ? "Të gjitha" : "All"}
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {recentOrders.map((order) => {
                    const sl = ORDER_STATUS_LABELS[order.status];
                    return (
                      <div key={order.id} className="flex items-center justify-between px-4 py-3">
                        <div>
                          <p className="text-xs font-mono text-muted-foreground">{order.orderNumber}</p>
                          <p className="text-sm font-semibold tabular-nums">{formatPrice(Number(order.total))}</p>
                        </div>
                        {sl && (
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sl.color}`}>
                            {sl[locale as "sq" | "en"]}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
