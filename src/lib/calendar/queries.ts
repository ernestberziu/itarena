import { db } from "@/lib/db";
import { STAFF_ROLES } from "@/types/domain";
import {
  buildMonthGrid,
  countPastDaysInMonth,
  formatCalendarDateFromDb,
  getMonthDateRange,
  getTodayCalendarDate,
  isFutureCalendarDate,
  parseCalendarDateForDb,
} from "./dates";
import type {
  CalendarDayPayload,
  CalendarDaySummary,
  CalendarMonthPayload,
  CalendarPrintPayload,
  CalendarReportPayload,
  CalendarReplyRow,
  CalendarReportRow,
} from "./types";

function serializeReply(reply: {
  id: string;
  body: string;
  createdAt: Date;
  author: { id: string; firstName: string; lastName: string; role: string };
}): CalendarReplyRow {
  return {
    id: reply.id,
    body: reply.body,
    createdAt: reply.createdAt.toISOString(),
    author: reply.author,
  };
}

function serializeReport(report: {
  id: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
  replies: {
    id: string;
    body: string;
    createdAt: Date;
    author: { id: string; firstName: string; lastName: string; role: string };
  }[];
}): CalendarReportRow {
  return {
    id: report.id,
    body: report.body,
    createdAt: report.createdAt.toISOString(),
    updatedAt: report.updatedAt.toISOString(),
    replies: report.replies.map(serializeReply),
  };
}

export async function getActiveStaffCount(): Promise<number> {
  return db.user.count({
    where: { role: { in: [...STAFF_ROLES] }, isActive: true },
  });
}

export async function getActiveStaffRoster() {
  return db.user.findMany({
    where: { role: { in: [...STAFF_ROLES] }, isActive: true },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      role: true,
    },
    orderBy: [{ role: "asc" }, { firstName: "asc" }],
  });
}

export async function getCalendarMonth(
  year: number,
  month: number,
  currentUserId: string
): Promise<CalendarMonthPayload> {
  const staffTotal = await getActiveStaffCount();
  const { from, to } = getMonthDateRange(year, month);
  const todayDate = getTodayCalendarDate();

  const reports = await db.staffDailyReport.findMany({
    where: {
      reportDate: {
        gte: parseCalendarDateForDb(from),
        lte: parseCalendarDateForDb(to),
      },
    },
    select: {
      userId: true,
      reportDate: true,
      replies: { select: { id: true }, take: 1 },
    },
  });

  const byDate = new Map<
    string,
    { userIds: Set<string>; ownHasAdminReply: boolean }
  >();
  for (const r of reports) {
    const date = formatCalendarDateFromDb(r.reportDate);
    const entry = byDate.get(date) ?? {
      userIds: new Set<string>(),
      ownHasAdminReply: false,
    };
    entry.userIds.add(r.userId);
    if (r.userId === currentUserId && r.replies.length > 0) {
      entry.ownHasAdminReply = true;
    }
    byDate.set(date, entry);
  }

  const grid = buildMonthGrid(year, month);
  const days: CalendarDaySummary[] = grid.map(({ date }) => {
    const entry = byDate.get(date);
    const submittedCount = entry?.userIds.size ?? 0;
    return {
      date,
      submittedCount,
      hasOwnReport: entry?.userIds.has(currentUserId) ?? false,
      hasAdminReply: entry?.ownHasAdminReply ?? false,
    };
  });

  let monthSubmittedTotal = 0;
  for (const { date, inMonth } of grid) {
    if (!inMonth || isFutureCalendarDate(date)) continue;
    monthSubmittedTotal += byDate.get(date)?.userIds.size ?? 0;
  }

  const pastDaysInMonth = countPastDaysInMonth(year, month);
  const monthPossibleTotal = pastDaysInMonth * staffTotal;
  const todayEntry = byDate.get(todayDate);

  return {
    year,
    month,
    staffTotal,
    monthSubmittedTotal,
    monthPossibleTotal,
    todayDate,
    todaySubmittedCount: todayEntry?.userIds.size ?? 0,
    days,
  };
}

export async function getCalendarDay(
  dateStr: string,
  currentUserId: string,
  isAdmin: boolean
): Promise<CalendarDayPayload> {
  const staff = await getActiveStaffRoster();
  const staffTotal = staff.length;
  const reportDate = parseCalendarDateForDb(dateStr);

  const reports = await db.staffDailyReport.findMany({
    where: { reportDate },
    include: {
      replies: {
        orderBy: { createdAt: "asc" },
        include: {
          author: {
            select: { id: true, firstName: true, lastName: true, role: true },
          },
        },
      },
    },
  });

  const reportByUser = new Map(reports.map((r) => [r.userId, r]));
  const submittedCount = reports.length;

  if (isAdmin) {
    return {
      date: dateStr,
      staffTotal,
      submittedCount,
      isAdminView: true,
      ownReport: null,
      staff: staff.map((s) => {
        const report = reportByUser.get(s.id);
        return {
          userId: s.id,
          firstName: s.firstName,
          lastName: s.lastName,
          role: s.role,
          report: report
            ? serializeReport({
                ...report,
                replies: report.replies,
              })
            : null,
        };
      }),
    };
  }

  const own = reportByUser.get(currentUserId);
  return {
    date: dateStr,
    staffTotal,
    submittedCount,
    isAdminView: false,
    staff: [],
    ownReport: own
      ? serializeReport({
          ...own,
          replies: own.replies,
        })
      : null,
  };
}

export async function upsertStaffDailyReport(
  userId: string,
  dateStr: string,
  body: string
): Promise<CalendarReportPayload> {
  const reportDate = parseCalendarDateForDb(dateStr);
  const report = await db.staffDailyReport.upsert({
    where: {
      userId_reportDate: { userId, reportDate },
    },
    create: { userId, reportDate, body },
    update: { body },
    include: {
      replies: {
        orderBy: { createdAt: "asc" },
        include: {
          author: {
            select: { id: true, firstName: true, lastName: true, role: true },
          },
        },
      },
    },
  });

  return {
    id: report.id,
    date: dateStr,
    body: report.body,
    createdAt: report.createdAt.toISOString(),
    updatedAt: report.updatedAt.toISOString(),
    replies: report.replies.map(serializeReply),
  };
}

export async function createStaffDailyReportReply(
  reportId: string,
  authorId: string,
  body: string
): Promise<CalendarReplyRow> {
  const reply = await db.staffDailyReportReply.create({
    data: { reportId, authorId, body },
    include: {
      author: {
        select: { id: true, firstName: true, lastName: true, role: true },
      },
    },
  });
  return serializeReply(reply);
}

export async function getReportById(reportId: string) {
  return db.staffDailyReport.findUnique({
    where: { id: reportId },
    select: { id: true, userId: true },
  });
}

export async function getCalendarPrintData(
  year: number,
  month: number,
  userIds?: string[]
): Promise<CalendarPrintPayload> {
  const { from, to } = getMonthDateRange(year, month);
  const roster = await getActiveStaffRoster();
  const filtered =
    userIds && userIds.length > 0
      ? roster.filter((s) => userIds.includes(s.id))
      : roster;

  const reports = await db.staffDailyReport.findMany({
    where: {
      reportDate: {
        gte: parseCalendarDateForDb(from),
        lte: parseCalendarDateForDb(to),
      },
      ...(userIds && userIds.length > 0 ? { userId: { in: userIds } } : {}),
    },
    include: {
      replies: {
        orderBy: { createdAt: "asc" },
        include: {
          author: {
            select: { id: true, firstName: true, lastName: true, role: true },
          },
        },
      },
    },
    orderBy: [{ reportDate: "asc" }],
  });

  const reportsByUserDate = new Map<string, (typeof reports)[number]>();
  for (const r of reports) {
    const key = `${r.userId}:${formatCalendarDateFromDb(r.reportDate)}`;
    reportsByUserDate.set(key, r);
  }

  const monthDays = buildMonthGrid(year, month)
    .filter((d) => d.inMonth)
    .map((d) => d.date);

  return {
    year,
    month,
    staff: filtered.map((member) => ({
      userId: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      role: member.role,
      days: monthDays.map((date) => {
        const report = reportsByUserDate.get(`${member.id}:${date}`);
        return {
          date,
          report: report
            ? serializeReport({
                ...report,
                replies: report.replies,
              })
            : null,
        };
      }),
    })),
  };
}
