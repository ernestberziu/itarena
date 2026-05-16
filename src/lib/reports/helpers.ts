import { format } from "date-fns";
import type { DailyPoint } from "./types";

const CLIENT_ROLES = ["CLIENT", "COMPANY_ADMIN"] as const;

export { CLIENT_ROLES };

export function decimal(n: unknown): number {
  if (n == null) return 0;
  return Number(n);
}

export function buildDailyBuckets(from: Date, to: Date, maxPoints = 90): Map<string, number> {
  const map = new Map<string, number>();
  const msPerDay = 86400000;
  const days = Math.max(1, Math.ceil((to.getTime() - from.getTime()) / msPerDay) + 1);
  const step = days > maxPoints ? Math.ceil(days / maxPoints) : 1;

  for (let i = 0; i < days; i += step) {
    const d = new Date(from.getTime() + i * msPerDay);
    if (d > to) break;
    map.set(format(d, "yyyy-MM-dd"), 0);
  }
  return map;
}

export function mapToDailyPoints(map: Map<string, number>): DailyPoint[] {
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value }));
}

export function addToBucket(map: Map<string, number>, date: Date, amount: number) {
  const key = format(date, "yyyy-MM-dd");
  if (map.has(key)) map.set(key, (map.get(key) ?? 0) + amount);
}

export function formatAll(amount: number, locale: "sq" | "en" = "sq"): string {
  return new Intl.NumberFormat(locale === "en" ? "en-GB" : "sq-AL", {
    style: "currency",
    currency: "ALL",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPct(n: number | null): string {
  if (n == null) return "—";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n}%`;
}

export type OrderItemLine = {
  sku?: string;
  productId?: string;
  name?: string;
  quantity?: number;
  price?: number;
};

export function parseOrderItems(raw: string): OrderItemLine[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as OrderItemLine[];
  } catch {
    return [];
  }
}
