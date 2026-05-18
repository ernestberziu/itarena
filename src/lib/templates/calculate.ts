import type { LineItem } from "./types";

export type LineTotals = {
  subtotal: number;
  vatAmount: number;
  total: number;
};

export function lineItemTotal(item: LineItem): number {
  const base = item.quantity * item.unitPrice;
  return base + base * (item.vatPercent / 100);
}

export function sumLineItems(items: LineItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}

export function computeContractTotals(
  services: LineItem[],
  products: LineItem[],
  vatEnabled: boolean
): LineTotals {
  const subtotal = sumLineItems(services) + sumLineItems(products);
  const vatAmount = vatEnabled
    ? services.reduce((s, i) => s + i.quantity * i.unitPrice * (i.vatPercent / 100), 0) +
      products.reduce((s, i) => s + i.quantity * i.unitPrice * (i.vatPercent / 100), 0)
    : 0;
  return { subtotal, vatAmount, total: subtotal + vatAmount };
}

export function formatMoney(amount: number, currency: string, locale: string): string {
  try {
    return new Intl.NumberFormat(locale === "en" ? "en-GB" : "sq-AL", {
      style: "currency",
      currency: currency.length === 3 ? currency : "ALL",
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}
