/** Order line fulfillment — stored on each item in `Order.items` JSON as `fulfilledQty`. */

export type OrderLineItem = {
  sku?: string;
  name: string;
  nameEn?: string;
  quantity: number;
  price: number;
  /** Staff-confirmed qty to ship; defaults to `quantity` when unset. */
  fulfilledQty?: number;
};

export type LineFulfillmentState = "full" | "partial" | "unavailable";

export function getFulfilledQty(item: OrderLineItem): number {
  const qty = item.fulfilledQty ?? item.quantity;
  if (!Number.isFinite(qty)) return item.quantity;
  return Math.min(Math.max(0, Math.floor(qty)), item.quantity);
}

export function getLineFulfillmentState(item: OrderLineItem): LineFulfillmentState {
  const fulfilled = getFulfilledQty(item);
  if (fulfilled <= 0) return "unavailable";
  if (fulfilled < item.quantity) return "partial";
  return "full";
}

export function lineFulfillmentTotal(item: OrderLineItem): number {
  return item.price * getFulfilledQty(item);
}

export function orderFulfillmentSummary(items: OrderLineItem[]) {
  let shortLines = 0;
  let unavailableLines = 0;
  let orderedUnits = 0;
  let fulfilledUnits = 0;
  let orderedTotal = 0;
  let fulfilledTotal = 0;

  for (const item of items) {
    const fulfilled = getFulfilledQty(item);
    orderedUnits += item.quantity;
    fulfilledUnits += fulfilled;
    orderedTotal += item.price * item.quantity;
    fulfilledTotal += item.price * fulfilled;
    const state = getLineFulfillmentState(item);
    if (state === "partial") shortLines += 1;
    if (state === "unavailable") unavailableLines += 1;
  }

  return {
    shortLines,
    unavailableLines,
    hasShortfall: shortLines > 0 || unavailableLines > 0,
    orderedUnits,
    fulfilledUnits,
    orderedTotal,
    fulfilledTotal,
  };
}

export function normalizeOrderItems(items: OrderLineItem[]): OrderLineItem[] {
  return items.map((item) => ({
    ...item,
    fulfilledQty: getFulfilledQty(item),
  }));
}

export function parseFulfillmentItems(json: string): OrderLineItem[] {
  if (!json || json === "[]") return [];
  try {
    const parsed = JSON.parse(json) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (row): row is OrderLineItem =>
          typeof row === "object" &&
          row != null &&
          typeof (row as OrderLineItem).name === "string" &&
          typeof (row as OrderLineItem).quantity === "number" &&
          typeof (row as OrderLineItem).price === "number"
      )
      .map((row) => ({
        ...row,
        fulfilledQty: getFulfilledQty(row),
      }));
  } catch {
    return [];
  }
}
