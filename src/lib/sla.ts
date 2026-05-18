import type { Prisma } from "@prisma/client";

/**
 * Whether the ticket missed its SLA deadline.
 * Open tickets: breach when now is past the deadline.
 * Resolved/closed: breach when resolved after the deadline.
 */
export function isSlaBreached(
  params: {
    slaDeadline: Date | null;
    status: string;
    resolvedAt?: Date | null;
  },
  now: Date = new Date()
): boolean {
  const { slaDeadline, status, resolvedAt } = params;
  if (!slaDeadline) return false;

  const terminal = ["RESOLVED", "CLOSED"].includes(status);
  if (terminal) {
    const end = resolvedAt ?? now;
    return end.getTime() > slaDeadline.getTime();
  }

  return now.getTime() > slaDeadline.getTime();
}

/** Prisma filter: open tickets currently past SLA deadline. */
export function openSlaBreachedWhere(now: Date = new Date()): Prisma.TicketWhereInput {
  return {
    slaDeadline: { lt: now },
    status: { notIn: ["RESOLVED", "CLOSED"] },
  };
}

/** Prisma filter: open tickets with SLA still on track (deadline in the future). */
export function openSlaOnTrackWhere(now: Date = new Date()): Prisma.TicketWhereInput {
  return {
    slaDeadline: { gte: now },
    status: { notIn: ["RESOLVED", "CLOSED"] },
  };
}

const missedSlaSelect = {
  id: true,
  slaDeadline: true,
  status: true,
  resolvedAt: true,
} as const;

type MissedSlaDb = {
  ticket: {
    findMany: (args: {
      where: { slaDeadline: { not: null }; status: { not: string } };
      select: typeof missedSlaSelect;
    }) => Promise<
      Array<{
        id: string;
        slaDeadline: Date | null;
        status: string;
        resolvedAt: Date | null;
      }>
    >;
  };
};

/**
 * Tickets that missed SLA: open past deadline, or resolved after deadline.
 * Excludes CLOSED only (resolved-but-not-closed still counts).
 */
export async function getMissedSlaTicketIds(
  db: MissedSlaDb,
  now: Date = new Date()
): Promise<string[]> {
  const tickets = await db.ticket.findMany({
    where: { slaDeadline: { not: null }, status: { not: "CLOSED" } },
    select: missedSlaSelect,
  });
  return tickets
    .filter((t) =>
      isSlaBreached(
        { slaDeadline: t.slaDeadline, status: t.status, resolvedAt: t.resolvedAt },
        now
      )
    )
    .map((t) => t.id);
}

export async function countMissedSlaTickets(
  db: MissedSlaDb,
  now: Date = new Date()
): Promise<number> {
  const ids = await getMissedSlaTicketIds(db, now);
  return ids.length;
}

/**
 * Value to persist on `Ticket.slaBreached` when estimate or status changes.
 */
export function computeSlaBreachedFlag(
  slaDeadline: Date | null,
  status: string,
  resolvedAt?: Date | null,
  now: Date = new Date()
): boolean {
  return isSlaBreached({ slaDeadline, status, resolvedAt }, now);
}

/**
 * Calculate what percentage of SLA time has elapsed (from ticket creation to deadline).
 */
export function getSlaElapsedPercent(
  createdAt: Date,
  deadline: Date,
  referenceTime: Date = new Date()
): number {
  const total = deadline.getTime() - createdAt.getTime();
  if (total <= 0) return 100;
  const elapsed = referenceTime.getTime() - createdAt.getTime();
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
}

/**
 * Get a human-readable SLA status label.
 */
export function getSlaStatus(
  createdAt: Date,
  deadline: Date | null,
  status: string,
  resolvedAt?: Date | null
): "none" | "on_track" | "at_risk" | "breached" {
  if (!deadline) return "none";

  if (["RESOLVED", "CLOSED"].includes(status)) {
    return isSlaBreached({ slaDeadline: deadline, status, resolvedAt }) ? "breached" : "none";
  }

  if (isSlaBreached({ slaDeadline: deadline, status, resolvedAt })) return "breached";

  const percent = getSlaElapsedPercent(createdAt, deadline);
  if (percent >= 75) return "at_risk";
  return "on_track";
}

type SlaTicketSlice = {
  slaDeadline: Date | null;
  status: string;
  resolvedAt?: Date | null;
};

/** Count compliant vs breached among tickets that have an SLA deadline. */
export function countSlaCompliance(tickets: SlaTicketSlice[]): {
  compliant: number;
  breached: number;
} {
  const withSla = tickets.filter((t) => t.slaDeadline != null);
  const breached = withSla.filter((t) =>
    isSlaBreached({
      slaDeadline: t.slaDeadline,
      status: t.status,
      resolvedAt: t.resolvedAt,
    })
  ).length;
  return { compliant: withSla.length - breached, breached };
}

export const DIVISION_LABELS: Record<string, { sq: string; en: string }> = {
  it_support: { sq: "Mbështetje IT", en: "IT Support" },
  cloud: { sq: "Cloud & Microsoft 365", en: "Cloud & Microsoft 365" },
  telecom: { sq: "Telekomunikacion", en: "Telecommunications" },
  web: { sq: "Web & Marketing", en: "Web & Marketing" },
  cctv: { sq: "CCTV & Siguri", en: "CCTV & Security" },
  network: { sq: "Rrjet", en: "Networking" },
  software: { sq: "Zhvillim Softuerësh", en: "Software Development" },
  printers: { sq: "Printerë", en: "Printers" },
};
