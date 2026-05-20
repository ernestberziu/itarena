import type { Priority, Role, TicketStatus } from "@/types/domain";

/** Status transitions visible to portal clients (timeline, API, future client notifications). */
export const CLIENT_VISIBLE_STATUS_NEW_VALUES = [
  "OPEN",
  "IN_PROGRESS",
  "PENDING_CLIENT",
  "RESOLVED",
  "CLOSED",
] as const satisfies readonly TicketStatus[];

const clientVisibleStatusSet = new Set<string>(CLIENT_VISIBLE_STATUS_NEW_VALUES);

/**
 * Whether a ticket history row may be shown to the portal client or used for client-targeted
 * notifications. Assignment, estimate, SLA, priority, and non–client-facing status transitions stay internal.
 */
export function isClientVisibleTicketHistoryRow(h: {
  field: string;
  newValue: string | null;
}): boolean {
  if (h.field !== "status" || h.newValue == null) return false;
  return clientVisibleStatusSet.has(h.newValue);
}

export function filterTicketHistoryForClient<
  T extends { field: string; newValue: string | null },
>(history: T[]): T[] {
  return history.filter(isClientVisibleTicketHistoryRow);
}

type StatusHistoryRow = {
  field: string;
  newValue: string | null;
  createdAt: Date | string;
};

/** Latest client-visible status from full ticket history (ignores internal PAUSED/ASSIGNED rows). */
export function getLatestClientVisibleStatus(
  history: StatusHistoryRow[]
): TicketStatus | null {
  let latest: { status: TicketStatus; at: number } | null = null;
  for (const row of history) {
    if (!isClientVisibleTicketHistoryRow(row) || !row.newValue) continue;
    const at = new Date(row.createdAt).getTime();
    if (!latest || at >= latest.at) {
      latest = { status: row.newValue as TicketStatus, at };
    }
  }
  return latest?.status ?? null;
}

/** Status badge value for portal clients — never surfaces internal PAUSED when a public IN_PROGRESS exists. */
export function resolveClientFacingTicketStatus(
  currentStatus: TicketStatus,
  fullHistory: StatusHistoryRow[]
): TicketStatus {
  const latestPublic = getLatestClientVisibleStatus(fullHistory);
  if (latestPublic) return latestPublic;
  if (currentStatus === "ASSIGNED" || currentStatus === "PAUSED") return "IN_PROGRESS";
  if (clientVisibleStatusSet.has(currentStatus)) return currentStatus;
  return "OPEN";
}

/** Keep only the most recent client-visible status row for portal activity timelines. */
export function latestClientStatusHistory<
  T extends StatusHistoryRow,
>(history: T[]): T[] {
  const visible = filterTicketHistoryForClient(history);
  if (visible.length === 0) return [];
  const latest = visible.reduce((a, b) =>
    new Date(a.createdAt).getTime() >= new Date(b.createdAt).getTime() ? a : b
  );
  return [latest];
}

const STATUS_LABELS: Record<TicketStatus, { sq: string; en: string }> = {
  OPEN: { sq: "Hapur", en: "Open" },
  ASSIGNED: { sq: "Caktuar", en: "Assigned" },
  IN_PROGRESS: { sq: "Në Progres", en: "In Progress" },
  PAUSED: { sq: "Në pauzë", en: "Paused" },
  PENDING_CLIENT: { sq: "Pret Klientin", en: "Pending Client" },
  RESOLVED: { sq: "Zgjidhur", en: "Resolved" },
  CLOSED: { sq: "Mbyllur", en: "Closed" },
};

const PRIORITY_LABELS: Record<Priority, { sq: string; en: string }> = {
  LOW: { sq: "E Ulët", en: "Low" },
  MEDIUM: { sq: "Mesatare", en: "Medium" },
  HIGH: { sq: "E Lartë", en: "High" },
  CRITICAL: { sq: "Kritike", en: "Critical" },
};

export type TicketCommentRow = {
  id: string;
  body: string;
  isInternal: boolean;
  createdAt: Date;
  author: { id: string; firstName: string; lastName: string; role: Role };
};

export type TicketHistoryRow = {
  id: string;
  field: string;
  oldValue: string | null;
  newValue: string | null;
  createdAt: Date;
  changedBy: { firstName: string; lastName: string; role: Role };
};

export type ActivityItem =
  | { kind: "comment"; id: string; createdAt: Date; comment: TicketCommentRow }
  | { kind: "history"; id: string; createdAt: Date; history: TicketHistoryRow };

export function mergeTicketActivity(
  comments: TicketCommentRow[],
  history: TicketHistoryRow[]
): ActivityItem[] {
  const out: ActivityItem[] = [
    ...comments.map((c) => ({
      kind: "comment" as const,
      id: `c-${c.id}`,
      createdAt: new Date(c.createdAt),
      comment: c,
    })),
    ...history.map((h) => ({
      kind: "history" as const,
      id: `h-${h.id}`,
      createdAt: new Date(h.createdAt),
      history: h,
    })),
  ];
  out.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return out;
}

function statusLabel(v: string | null, locale: "sq" | "en"): string {
  if (!v) return "—";
  const s = v as TicketStatus;
  return STATUS_LABELS[s]?.[locale] ?? v;
}

function priorityLabel(v: string | null, locale: "sq" | "en"): string {
  if (!v) return "—";
  const p = v as Priority;
  return PRIORITY_LABELS[p]?.[locale] ?? v;
}

function engineerName(id: string | null, byId: Map<string, string>, lang: "sq" | "en"): string {
  if (!id) return lang === "sq" ? "Pa caktim" : "Unassigned";
  return byId.get(id) ?? id.slice(0, 8) + "…";
}

/** Human-readable one-line summary for a history row (sq/en). */
export function formatHistoryActivity(
  h: TicketHistoryRow,
  locale: string,
  engineerById: Map<string, string>
): string {
  const lang = locale === "en" ? "en" : "sq";
  const who = `${h.changedBy.firstName} ${h.changedBy.lastName}`;

  switch (h.field) {
    case "status":
      return lang === "sq"
        ? `${who}: statusi ${statusLabel(h.oldValue, lang)} → ${statusLabel(h.newValue, lang)}`
        : `${who}: status ${statusLabel(h.oldValue, lang)} → ${statusLabel(h.newValue, lang)}`;
    case "priority":
      return lang === "sq"
        ? `${who}: prioriteti ${priorityLabel(h.oldValue, lang)} → ${priorityLabel(h.newValue, lang)}`
        : `${who}: priority ${priorityLabel(h.oldValue, lang)} → ${priorityLabel(h.newValue, lang)}`;
    case "assignedTo":
      return lang === "sq"
        ? `${who}: caktimi ${engineerName(h.oldValue, engineerById, lang)} → ${engineerName(h.newValue, engineerById, lang)}`
        : `${who}: assignee ${engineerName(h.oldValue, engineerById, lang)} → ${engineerName(h.newValue, engineerById, lang)}`;
    case "projectId":
      return lang === "sq"
        ? `${who}: projekti ${h.oldValue ?? "—"} → ${h.newValue ?? "—"}`
        : `${who}: project ${h.oldValue ?? "—"} → ${h.newValue ?? "—"}`;
    case "estimatedDays": {
      const label = lang === "sq" ? "ditë vlerësimi" : "estimated days";
      return lang === "sq"
        ? `${who}: ${label} ${h.oldValue ?? "—"} → ${h.newValue ?? "—"}`
        : `${who}: ${label} ${h.oldValue ?? "—"} → ${h.newValue ?? "—"}`;
    }
    case "estimatedHours": {
      const label = lang === "sq" ? "orë vlerësimi" : "estimated hours";
      return lang === "sq"
        ? `${who}: ${label} ${h.oldValue ?? "—"} → ${h.newValue ?? "—"}`
        : `${who}: ${label} ${h.oldValue ?? "—"} → ${h.newValue ?? "—"}`;
    }
    case "slaDeadline": {
      const fmt = (iso: string | null) =>
        iso ? new Date(iso).toLocaleString(locale === "en" ? "en-GB" : "sq-AL", { dateStyle: "short", timeStyle: "short" }) : "—";
      return lang === "sq"
        ? `${who}: afati SLA ${fmt(h.oldValue)} → ${fmt(h.newValue)}`
        : `${who}: SLA deadline ${fmt(h.oldValue)} → ${fmt(h.newValue)}`;
    }
    default:
      return lang === "sq"
        ? `${who}: ${h.field} ${h.oldValue ?? "—"} → ${h.newValue ?? "—"}`
        : `${who}: ${h.field} ${h.oldValue ?? "—"} → ${h.newValue ?? "—"}`;
  }
}

/** Client-facing one-line status change (no staff names). */
export function formatClientStatusHistory(h: TicketHistoryRow, locale: string): string {
  const lang = locale === "en" ? "en" : "sq";
  if (h.field === "status") {
    return lang === "sq"
      ? `Statusi u përditësua në ${statusLabel(h.newValue, lang)}`
      : `Status updated to ${statusLabel(h.newValue, lang)}`;
  }
  return formatHistoryActivity(h, locale, new Map());
}
