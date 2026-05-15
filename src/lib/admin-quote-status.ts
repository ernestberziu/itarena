/** Shared quote status constants — server + client safe (not a "use client" module). */
export const QUOTE_STATUSES: string[] = [
  "PENDING",
  "REVIEWING",
  "SENT",
  "ACCEPTED",
  "REJECTED",
  "REVISION_REQUESTED",
];

export const STATUS_LABELS: Record<
  string,
  { sq: string; en: string; color: string }
> = {
  PENDING: {
    sq: "Pritëse",
    en: "Pending",
    color:
      "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400",
  },
  REVIEWING: {
    sq: "Shqyrtohet",
    en: "Reviewing",
    color:
      "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400",
  },
  SENT: {
    sq: "Dërguar",
    en: "Sent",
    color:
      "text-indigo-600 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400",
  },
  ACCEPTED: {
    sq: "Pranuar",
    en: "Accepted",
    color:
      "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400",
  },
  REJECTED: {
    sq: "Refuzuar",
    en: "Rejected",
    color:
      "text-red-600 bg-red-50 border-red-200 dark:bg-red-950/30 dark:text-red-400",
  },
  REVISION_REQUESTED: {
    sq: "Kërkohet rishikim",
    en: "Revision Requested",
    color:
      "text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400",
  },
};
