/** One “day” in estimates = this many hours toward SLA resolutionHours (wall-clock from createdAt). */
export const WORKING_HOURS_PER_DAY = 8;
export const MAX_RESOLUTION_HOURS = 4000;

function toNonNegativeInt(v: unknown, max: number): number {
  if (v == null || v === "") return 0;
  const n = typeof v === "number" ? v : Number.parseInt(String(v), 10);
  if (!Number.isFinite(n)) return 0;
  return Math.min(max, Math.max(0, Math.trunc(n)));
}

export function normalizeTicketEstimate(
  estimatedDays: number | string | null | undefined,
  estimatedHours: number | string | null | undefined
): {
  estimatedDays: number | null;
  estimatedHours: number | null;
  resolutionHours: number | null;
} {
  const dRaw = toNonNegativeInt(estimatedDays, 62);
  const hRaw = toNonNegativeInt(estimatedHours, 500);
  if (dRaw <= 0 && hRaw <= 0) {
    return { estimatedDays: null, estimatedHours: null, resolutionHours: null };
  }
  const sum = Math.min(MAX_RESOLUTION_HOURS, dRaw * WORKING_HOURS_PER_DAY + hRaw);
  if (sum <= 0) {
    return { estimatedDays: null, estimatedHours: null, resolutionHours: null };
  }
  return {
    estimatedDays: dRaw > 0 ? dRaw : null,
    estimatedHours: hRaw > 0 ? hRaw : null,
    resolutionHours: sum,
  };
}

export function slaDeadlineFromEstimate(
  createdAt: Date,
  resolutionHours: number | null
): Date | null {
  if (resolutionHours == null || resolutionHours <= 0) return null;
  return new Date(createdAt.getTime() + resolutionHours * 60 * 60 * 1000);
}
