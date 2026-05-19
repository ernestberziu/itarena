import { STATUS_LABELS as ORDER_STATUS_LABELS } from "@/lib/admin-order-status";
import { STATUS_LABELS as QUOTE_STATUS_LABELS } from "@/lib/admin-quote-status";
import type { KpiKey, ReportSectionId } from "./types";

export const KPI_LABELS: Record<KpiKey, { sq: string; en: string }> = {
  revenue: { sq: "Xhiro totale", en: "Total revenue" },
  orders: { sq: "Porosi", en: "Orders" },
  aov: { sq: "Vlera mesatare e porosisë", en: "Average order value" },
  revenueGrowth: { sq: "Rritje e xhiros", en: "Revenue growth" },
  newCustomers: { sq: "Klientë të rinj", en: "New customers" },
  activeCustomers: { sq: "Klientë aktivë", en: "Active customers" },
  returningCustomers: { sq: "Klientë kthyes", en: "Returning customers" },
  quotePipeline: { sq: "Pipeline ofertash", en: "Quote pipeline" },
  quoteWinRate: { sq: "Shkalla e fitores së ofertave", en: "Quote win rate" },
  ticketsResolved: { sq: "Bileta të zgjidhura", en: "Tickets resolved" },
};

export const SECTION_TITLES: Record<ReportSectionId, { sq: string; en: string }> = {
  overview: { sq: "Përmbledhje", en: "Overview" },
  revenue: { sq: "Xhiro", en: "Revenue" },
  users: { sq: "Përdorues & klientë", en: "Users & clients" },
  quotes: { sq: "Oferta", en: "Quotes" },
  products: { sq: "Produkte", en: "Products" },
  funnel: { sq: "Funnel komercial", en: "Commercial funnel" },
  support: { sq: "Mbështetje", en: "Support" },
  projects: { sq: "Projektet", en: "Projects" },
};

const FUNNEL_STAGE_LABELS: Record<string, { sq: string; en: string }> = {
  signups: { sq: "Regjistrime", en: "Sign-ups" },
  quotes: { sq: "Oferta të krijuara", en: "Quotes created" },
  quotesAccepted: { sq: "Oferta të pranuara", en: "Quotes accepted" },
  orders: { sq: "Porosi", en: "Orders" },
  PENDING: QUOTE_STATUS_LABELS.PENDING,
  REVIEWING: QUOTE_STATUS_LABELS.REVIEWING,
  SENT: QUOTE_STATUS_LABELS.SENT,
  ACCEPTED: QUOTE_STATUS_LABELS.ACCEPTED,
};

const TIER_LABELS: Record<string, { sq: string; en: string }> = {
  RETAIL: { sq: "Pakicë", en: "Retail" },
  B2B: { sq: "B2B", en: "B2B" },
};

const PROJECT_STATUS_LABELS: Record<string, { sq: string; en: string }> = {
  ACTIVE: { sq: "Aktiv", en: "Active" },
  COMPLETED: { sq: "Përfunduar", en: "Completed" },
  ARCHIVED: { sq: "Arkivuar", en: "Archived" },
};

const STEP_STATUS_LABELS: Record<string, { sq: string; en: string }> = {
  OPEN: { sq: "Hapur", en: "Open" },
  IN_PROGRESS: { sq: "Në progres", en: "In progress" },
  ON_HOLD: { sq: "Në pritje", en: "On hold" },
  CLOSED: { sq: "Mbyllur", en: "Closed" },
};

const AUDIT_ACTION_LABELS: Record<string, { sq: string; en: string }> = {
  CREATE: { sq: "Krijim", en: "Create" },
  UPDATE: { sq: "Përditësim", en: "Update" },
  DELETE: { sq: "Fshirje", en: "Delete" },
  LOGIN: { sq: "Hyrje", en: "Login" },
  LOGOUT: { sq: "Dalje", en: "Logout" },
};

export type ReportLocale = "sq" | "en";

function pick(locale: ReportLocale, labels: { sq: string; en: string }): string {
  return locale === "en" ? labels.en : labels.sq;
}

export function getKpiLabel(key: KpiKey | string, locale: ReportLocale): string {
  const k = key as KpiKey;
  if (KPI_LABELS[k]) return pick(locale, KPI_LABELS[k]);
  return humanizeId(key, locale);
}

export function getSectionTitle(section: ReportSectionId, locale: ReportLocale): string {
  return pick(locale, SECTION_TITLES[section]);
}

export function labelOrderStatus(status: string, locale: ReportLocale): string {
  const entry = ORDER_STATUS_LABELS[status];
  return entry ? pick(locale, entry) : humanizeId(status, locale);
}

export function labelQuoteStatus(status: string, locale: ReportLocale): string {
  const entry = QUOTE_STATUS_LABELS[status];
  return entry ? pick(locale, entry) : humanizeId(status, locale);
}

export function labelFunnelStage(stage: string, locale: ReportLocale): string {
  const entry = FUNNEL_STAGE_LABELS[stage];
  return entry ? pick(locale, entry) : humanizeId(stage, locale);
}

export function labelTier(tier: string, locale: ReportLocale): string {
  const entry = TIER_LABELS[tier];
  return entry ? pick(locale, entry) : humanizeId(tier, locale);
}

export function labelAuditAction(action: string, locale: ReportLocale): string {
  const entry = AUDIT_ACTION_LABELS[action];
  return entry ? pick(locale, entry) : humanizeId(action, locale);
}

export function labelProjectStatus(status: string, locale: ReportLocale): string {
  const entry = PROJECT_STATUS_LABELS[status];
  return entry ? pick(locale, entry) : humanizeId(status, locale);
}

export function labelStepStatus(status: string, locale: ReportLocale): string {
  const entry = STEP_STATUS_LABELS[status];
  return entry ? pick(locale, entry) : humanizeId(status, locale);
}

function humanizeId(id: string, locale: ReportLocale): string {
  const spaced = id.replace(/_/g, " ").toLowerCase();
  if (locale === "sq") return spaced;
  return spaced.replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Format a raw cell for export (CSV/XLSX/PDF) with human-readable labels. */
export function formatExportCell(
  section: ReportSectionId,
  columnKey: string,
  value: unknown,
  locale: ReportLocale
): string {
  if (value == null) return "";
  if (typeof value === "number") {
    if (columnKey === "revenue" || columnKey === "total") {
      return new Intl.NumberFormat(locale === "en" ? "en-GB" : "sq-AL", {
        style: "currency",
        currency: "ALL",
        maximumFractionDigits: 0,
      }).format(value);
    }
    return String(value);
  }

  const str = String(value);

  if (section === "overview" && columnKey === "metric") {
    return getKpiLabel(str, locale);
  }
  if (columnKey === "status") {
    if (section === "projects") return labelProjectStatus(str, locale);
    return section === "quotes" ? labelQuoteStatus(str, locale) : labelOrderStatus(str, locale);
  }
  if (columnKey === "stepStatus") {
    return labelStepStatus(str, locale);
  }
  if (columnKey === "stage") {
    return labelFunnelStage(str, locale);
  }
  if (columnKey === "action") {
    return labelAuditAction(str, locale);
  }
  if (columnKey === "tier") {
    return labelTier(str, locale);
  }

  return str;
}
