/** Shared order status constants — server + client safe (not a "use client" module). */
export const ORDER_STATUSES: string[] = [
  "PLACED",
  "CONFIRMED",
  "DISPATCHED",
  "DELIVERED",
  "CANCELLED",
];

export const STATUS_LABELS: Record<
  string,
  { sq: string; en: string; color: string }
> = {
  PLACED: {
    sq: "Vendosur",
    en: "Placed",
    color:
      "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400",
  },
  CONFIRMED: {
    sq: "Konfirmuar",
    en: "Confirmed",
    color:
      "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400",
  },
  DISPATCHED: {
    sq: "Dërguar",
    en: "Dispatched",
    color:
      "text-indigo-600 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400",
  },
  DELIVERED: {
    sq: "Dorëzuar",
    en: "Delivered",
    color:
      "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400",
  },
  CANCELLED: {
    sq: "Anuluar",
    en: "Cancelled",
    color:
      "text-red-600 bg-red-50 border-red-200 dark:bg-red-950/30 dark:text-red-400",
  },
};
