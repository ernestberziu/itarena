/** Matches Prisma `@db.Decimal(10, 2)` — 8 digits before the decimal point. */
export const QUOTE_MONEY_MAX = 99_999_999.99;

export function parseQuoteMoneyInput(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const normalized = trimmed.replace(/\s/g, "").replace(",", ".");
  const n = Number(normalized);
  if (!Number.isFinite(n) || n <= 0 || n > QUOTE_MONEY_MAX) return null;

  return Math.round(n * 100) / 100;
}

export function isQuoteMoneyInRange(value: number): boolean {
  return Number.isFinite(value) && value > 0 && value <= QUOTE_MONEY_MAX;
}
