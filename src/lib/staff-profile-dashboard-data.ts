import { db } from "@/lib/db";
import type { Role } from "@/types/domain";
import type { AdminFeature, AclLevel } from "@/lib/admin-acl/features";
import { hasAclLevel } from "@/lib/admin-acl/features";
import { countUnreadNotifications } from "@/lib/notification-count";
import {
  getCalendarDay,
  getTodayCalendarDate,
  getYesterdayCalendarDate,
} from "@/lib/calendar";
import { isCalendarAdmin } from "@/lib/calendar/access";
import { isSlaBreached, openSlaBreachedWhere } from "@/lib/sla";
import type { CalendarDayPayload } from "@/lib/calendar/types";

export type StaffProfileTicketRow = {
  id: string;
  number: string;
  title: string;
  status: string;
  priority: string;
  slaDeadline: Date | null;
  resolvedAt: Date | null;
};

export type StaffProfileQuoteRow = {
  id: string;
  quoteNumber: string;
  title: string;
  companyName: string;
  status: string;
  createdAt: Date;
};

export type StaffProfileOrderRow = {
  id: string;
  orderNumber: string;
  status: string;
  total: { toString(): string };
  createdAt: Date;
  user: { firstName: string; lastName: string };
};

export type StaffProfileProjectRow = {
  id: string;
  title: string;
  status: string;
  slug: string;
};

export type StaffProfileConversationRow = {
  id: string;
  type: string;
  title: string | null;
  lastMessageAt: Date | null;
  project: { title: string } | null;
};

export type StaffProfileNotificationRow = {
  id: string;
  title: string;
  body: string;
  link: string | null;
  createdAt: Date;
};

export type StaffProfileDashboardData = {
  kpis: {
    assignedTickets?: number;
    slaAtRisk?: number;
    pendingQuotes?: number;
    pendingOrders?: number;
    activeProjects?: number;
    unreadNotifications?: number;
    clientCount?: number;
    companyCount?: number;
  };
  assignedTickets: StaffProfileTicketRow[];
  pendingQuotes: StaffProfileQuoteRow[];
  pendingOrders: StaffProfileOrderRow[];
  activeProjects: StaffProfileProjectRow[];
  recentConversations: StaffProfileConversationRow[];
  recentNotifications: StaffProfileNotificationRow[];
  calendarToday: CalendarDayPayload | null;
  calendarYesterday: CalendarDayPayload | null;
};

export async function fetchStaffProfileDashboard(
  userId: string,
  role: Role,
  acl: Record<AdminFeature, AclLevel>,
  _locale: string
): Promise<StaffProfileDashboardData> {
  const canTickets = hasAclLevel(acl, "tickets", "read");
  const canQuotes = hasAclLevel(acl, "quotes", "read");
  const canOrders = hasAclLevel(acl, "orders", "read");
  const canProjects = hasAclLevel(acl, "projects", "read");
  const canNotifications = hasAclLevel(acl, "notifications", "read");
  const canMessages = hasAclLevel(acl, "messages", "read");
  const canCalendar = hasAclLevel(acl, "calendar", "read");
  const canClients = hasAclLevel(acl, "clients", "read");
  const canCompanies = hasAclLevel(acl, "companies", "read");

  const [
    assignedTicketCount,
    slaAtRiskCount,
    assignedTickets,
    pendingQuoteCount,
    pendingQuotes,
    pendingOrderCount,
    pendingOrders,
    activeProjectCount,
    activeProjects,
    unreadNotifications,
    recentNotifications,
    recentConversations,
    clientCount,
    companyCount,
    calendarToday,
    calendarYesterday,
  ] = await Promise.all([
    canTickets
      ? db.ticket.count({
          where: {
            assignedToId: userId,
            status: { notIn: ["RESOLVED", "CLOSED"] },
          },
        })
      : Promise.resolve(undefined),
    canTickets
      ? db.ticket.count({
          where: {
            assignedToId: userId,
            ...openSlaBreachedWhere(),
          },
        })
      : Promise.resolve(undefined),
    canTickets
      ? db.ticket.findMany({
          where: {
            assignedToId: userId,
            status: { notIn: ["RESOLVED", "CLOSED"] },
          },
          orderBy: [{ slaDeadline: "asc" }, { priority: "desc" }, { createdAt: "asc" }],
          take: 6,
          select: {
            id: true,
            number: true,
            title: true,
            status: true,
            priority: true,
            slaDeadline: true,
            resolvedAt: true,
          },
        })
      : Promise.resolve([]),
    canQuotes
      ? db.quote.count({
          where: { status: { in: ["PENDING", "REVIEWING", "REVISION_REQUESTED"] } },
        })
      : Promise.resolve(undefined),
    canQuotes
      ? db.quote.findMany({
          where: { status: { in: ["PENDING", "REVIEWING", "REVISION_REQUESTED"] } },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            quoteNumber: true,
            title: true,
            companyName: true,
            status: true,
            createdAt: true,
          },
        })
      : Promise.resolve([]),
    canOrders
      ? db.order.count({ where: { status: "PLACED" } })
      : Promise.resolve(undefined),
    canOrders
      ? db.order.findMany({
          where: { status: "PLACED" },
          orderBy: { createdAt: "desc" },
          take: 5,
          include: { user: { select: { firstName: true, lastName: true } } },
        })
      : Promise.resolve([]),
    canProjects
      ? db.project.count({
          where: {
            status: "ACTIVE",
            members: { some: { userId } },
          },
        })
      : Promise.resolve(undefined),
    canProjects
      ? db.project.findMany({
          where: {
            status: "ACTIVE",
            members: { some: { userId } },
          },
          orderBy: { updatedAt: "desc" },
          take: 5,
          select: { id: true, title: true, status: true, slug: true },
        })
      : Promise.resolve([]),
    canNotifications ? countUnreadNotifications(userId) : Promise.resolve(undefined),
    canNotifications
      ? db.notification.findMany({
          where: { userId, readAt: null },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: { id: true, title: true, body: true, link: true, createdAt: true },
        })
      : Promise.resolve([]),
    canMessages
      ? db.conversation.findMany({
          where: { participants: { some: { userId } } },
          orderBy: { lastMessageAt: "desc" },
          take: 5,
          select: {
            id: true,
            type: true,
            title: true,
            lastMessageAt: true,
            project: { select: { title: true } },
          },
        })
      : Promise.resolve([]),
    canClients
      ? db.user.count({ where: { role: { in: ["CLIENT", "COMPANY_ADMIN"] } } })
      : Promise.resolve(undefined),
    canCompanies ? db.company.count() : Promise.resolve(undefined),
    canCalendar
      ? getCalendarDay(getTodayCalendarDate(), userId, isCalendarAdmin(role)).catch(() => null)
      : Promise.resolve(null),
    canCalendar
      ? getCalendarDay(getYesterdayCalendarDate(), userId, isCalendarAdmin(role)).catch(() => null)
      : Promise.resolve(null),
  ]);

  return {
    kpis: {
      assignedTickets: assignedTicketCount,
      slaAtRisk: slaAtRiskCount,
      pendingQuotes: pendingQuoteCount,
      pendingOrders: pendingOrderCount,
      activeProjects: activeProjectCount,
      unreadNotifications,
      clientCount,
      companyCount,
    },
    assignedTickets,
    pendingQuotes,
    pendingOrders,
    activeProjects,
    recentConversations,
    recentNotifications,
    calendarToday,
    calendarYesterday,
  };
}

/** Whether a ticket row is currently SLA-breached (for UI badges). */
export { isSlaBreached };
