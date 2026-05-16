import {
  endOfDay,
  endOfMonth,
  endOfQuarter,
  endOfYear,
  startOfDay,
  startOfMonth,
  startOfQuarter,
  startOfYear,
  subDays,
  subMonths,
  subQuarters,
} from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import type { ReportDatePresetId, ReportRange } from "./types";

export type { ReportDatePresetId, ReportRange };

export const DEFAULT_REPORT_TZ = "Europe/Tirane";

export const DATE_PRESET_IDS: ReportDatePresetId[] = [
  "today",
  "yesterday",
  "last7",
  "last30",
  "last90",
  "thisMonth",
  "lastMonth",
  "thisQuarter",
  "thisYear",
  "custom",
];

export function resolveReportRange(params: {
  preset?: string | null;
  from?: string | null;
  to?: string | null;
  tz?: string | null;
}): ReportRange {
  const tz = params.tz?.trim() || DEFAULT_REPORT_TZ;
  const preset = (params.preset as ReportDatePresetId) || "last30";
  const nowZoned = toZonedTime(new Date(), tz);

  let fromZoned: Date;
  let toZoned: Date;

  switch (preset) {
    case "today":
      fromZoned = startOfDay(nowZoned);
      toZoned = endOfDay(nowZoned);
      break;
    case "yesterday": {
      const y = subDays(nowZoned, 1);
      fromZoned = startOfDay(y);
      toZoned = endOfDay(y);
      break;
    }
    case "last7":
      fromZoned = startOfDay(subDays(nowZoned, 6));
      toZoned = endOfDay(nowZoned);
      break;
    case "last90":
      fromZoned = startOfDay(subDays(nowZoned, 89));
      toZoned = endOfDay(nowZoned);
      break;
    case "thisMonth":
      fromZoned = startOfMonth(nowZoned);
      toZoned = endOfDay(nowZoned);
      break;
    case "lastMonth": {
      const lm = subMonths(nowZoned, 1);
      fromZoned = startOfMonth(lm);
      toZoned = endOfMonth(lm);
      break;
    }
    case "thisQuarter":
      fromZoned = startOfQuarter(nowZoned);
      toZoned = endOfDay(nowZoned);
      break;
    case "thisYear":
      fromZoned = startOfYear(nowZoned);
      toZoned = endOfDay(nowZoned);
      break;
    case "custom":
      if (params.from && params.to) {
        fromZoned = startOfDay(toZonedTime(new Date(params.from), tz));
        toZoned = endOfDay(toZonedTime(new Date(params.to), tz));
      } else {
        fromZoned = startOfDay(subDays(nowZoned, 29));
        toZoned = endOfDay(nowZoned);
      }
      break;
    case "last30":
    default:
      fromZoned = startOfDay(subDays(nowZoned, 29));
      toZoned = endOfDay(nowZoned);
      break;
  }

  const fromUtc = fromZonedTime(fromZoned, tz);
  const toUtc = fromZonedTime(toZoned, tz);

  return {
    from: fromUtc.toISOString(),
    to: toUtc.toISOString(),
    tz,
    preset,
  };
}

export function previousRange(range: ReportRange): ReportRange {
  const from = new Date(range.from);
  const to = new Date(range.to);
  const durationMs = to.getTime() - from.getTime();
  const prevTo = new Date(from.getTime() - 1);
  const prevFrom = new Date(prevTo.getTime() - durationMs);
  return {
    from: prevFrom.toISOString(),
    to: prevTo.toISOString(),
    tz: range.tz,
    preset: range.preset,
  };
}

export function rangeToDates(range: ReportRange): { from: Date; to: Date } {
  return { from: new Date(range.from), to: new Date(range.to) };
}

export function pctDelta(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}
