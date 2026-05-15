import type { Priority, Role, TicketStatus } from "@/types/domain";

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
