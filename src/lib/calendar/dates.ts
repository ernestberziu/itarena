import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  startOfMonth,
  subDays,
} from "date-fns";
import { toZonedTime } from "date-fns-tz";

export const CALENDAR_TZ = "Europe/Tirane";

export function formatCalendarDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/** Format a `@db.Date` value without local timezone shift (UTC date-only). */
export function formatCalendarDateFromDb(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function getTodayCalendarDate(tz = CALENDAR_TZ): string {
  return format(toZonedTime(new Date(), tz), "yyyy-MM-dd");
}

export function parseCalendarDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y!, m! - 1, d);
}

/** Parse YYYY-MM-DD for PostgreSQL DATE columns (UTC midnight). */
export function parseCalendarDateForDb(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y!, m! - 1, d!));
}

export function getTodayInTz(tz = CALENDAR_TZ): Date {
  return parseCalendarDate(getTodayCalendarDate(tz));
}

export function getYesterdayCalendarDate(tz = CALENDAR_TZ): string {
  return formatCalendarDate(subDays(parseCalendarDate(getTodayCalendarDate(tz)), 1));
}

export function isFutureCalendarDate(dateStr: string, tz = CALENDAR_TZ): boolean {
  return dateStr > getTodayCalendarDate(tz);
}

export function isTodayCalendarDate(dateStr: string, tz = CALENDAR_TZ): boolean {
  return dateStr === getTodayCalendarDate(tz);
}

/** Monday-first grid cells for a month view (includes leading/trailing days). */
export function buildMonthGrid(year: number, month: number): { date: string; inMonth: boolean }[] {
  const monthStart = startOfMonth(new Date(year, month - 1, 1));
  const monthEnd = endOfMonth(monthStart);
  const startOffset = (getDay(monthStart) + 6) % 7;
  const gridStart = subDays(monthStart, startOffset);
  const totalCells = Math.ceil((startOffset + monthEnd.getDate()) / 7) * 7;
  const gridEnd = addDays(gridStart, totalCells - 1);

  return eachDayOfInterval({ start: gridStart, end: gridEnd }).map((d) => ({
    date: formatCalendarDate(d),
    inMonth: d.getMonth() === month - 1,
  }));
}

export function getMonthDateRange(year: number, month: number): { from: string; to: string } {
  const monthStart = startOfMonth(new Date(year, month - 1, 1));
  const monthEnd = endOfMonth(monthStart);
  return {
    from: formatCalendarDate(monthStart),
    to: formatCalendarDate(monthEnd),
  };
}

export function countPastDaysInMonth(year: number, month: number, tz = CALENDAR_TZ): number {
  const today = getTodayCalendarDate(tz);
  const { from, to } = getMonthDateRange(year, month);
  if (from > today) return 0;
  const end = to < today ? to : today;
  if (from > end) return 0;

  return eachDayOfInterval({ start: parseCalendarDate(from), end: parseCalendarDate(end) }).length;
}
