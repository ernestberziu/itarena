/** Display helpers for quote JSON fields — safe parse, no throws to UI. */

import { divisionLabel } from "@/lib/division-labels";

export function quoteServiceLabel(serviceId: string, locale: "sq" | "en"): string {
  return divisionLabel(serviceId, locale);
}

export function summarizeServicesJson(
  servicesJson: string,
  locale: "sq" | "en" = "sq",
  maxLen = 72
): string {
  if (!servicesJson || servicesJson === "[]") return "";
  try {
    const parsed = JSON.parse(servicesJson) as unknown;
    if (!Array.isArray(parsed)) return "";
    const parts = parsed
      .filter((x): x is string => typeof x === "string")
      .slice(0, 4)
      .map((id) => divisionLabel(id, locale));
    const s = parts.join(" · ");
    if (s.length <= maxLen) return s;
    return `${s.slice(0, maxLen - 1)}…`;
  } catch {
    return "";
  }
}

export function isQuoteExpired(params: {
  validUntil: string | null | undefined;
  status: string;
}): boolean {
  if (!params.validUntil) return false;
  const terminal = ["ACCEPTED", "REJECTED"];
  if (terminal.includes(params.status)) return false;
  return new Date(params.validUntil).getTime() < Date.now();
}
