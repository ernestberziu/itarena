/**
 * Calculate what percentage of SLA time has elapsed (from ticket creation to deadline).
 */
export function getSlaElapsedPercent(
  createdAt: Date,
  deadline: Date
): number {
  const now = Date.now();
  const total = deadline.getTime() - createdAt.getTime();
  if (total <= 0) return 100;
  const elapsed = now - createdAt.getTime();
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
}

/**
 * Get a human-readable SLA status label.
 */
export function getSlaStatus(
  createdAt: Date,
  deadline: Date | null,
  status: string
): "none" | "on_track" | "at_risk" | "breached" {
  if (!deadline || ["RESOLVED", "CLOSED"].includes(status)) return "none";
  const percent = getSlaElapsedPercent(createdAt, deadline);
  if (percent >= 100) return "breached";
  if (percent >= 75) return "at_risk";
  return "on_track";
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
