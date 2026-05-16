import type { ReportDatePresetId } from "./types";

export type MetricDef = { id: string; labelSq: string; labelEn: string };
export type ChartType = "line" | "bar" | "area" | "donut" | "funnel";

export const REPORT_METRICS: MetricDef[] = [
  { id: "revenue", labelSq: "Xhiro", labelEn: "Revenue" },
  { id: "orders", labelSq: "Porosi", labelEn: "Orders" },
  { id: "newCustomers", labelSq: "Klientë të rinj", labelEn: "New customers" },
  { id: "quotes", labelSq: "Oferta", labelEn: "Quotes" },
  { id: "tickets", labelSq: "Bileta", labelEn: "Tickets" },
];

export const REPORT_DIMENSIONS: MetricDef[] = [
  { id: "day", labelSq: "Ditë", labelEn: "Day" },
  { id: "status", labelSq: "Status", labelEn: "Status" },
  { id: "tier", labelSq: "Tier", labelEn: "Tier" },
  { id: "country", labelSq: "Shteti", labelEn: "Country" },
];

export const REPORT_CHART_TYPES: { id: ChartType; labelSq: string; labelEn: string }[] = [
  { id: "line", labelSq: "Vijë", labelEn: "Line" },
  { id: "bar", labelSq: "Shtylla", labelEn: "Bar" },
  { id: "area", labelSq: "Zonë", labelEn: "Area" },
  { id: "donut", labelSq: "Donut", labelEn: "Donut" },
  { id: "funnel", labelSq: "Funnel", labelEn: "Funnel" },
];

export type ReportPresetConfig = {
  metrics: string[];
  dimensions: string[];
  chartType: ChartType;
  defaultRange: ReportDatePresetId;
  sections: string[];
};

export const DEFAULT_PRESET_CONFIG: ReportPresetConfig = {
  metrics: ["revenue", "orders", "newCustomers"],
  dimensions: ["day"],
  chartType: "line",
  defaultRange: "last30",
  sections: ["revenue", "users", "quotes", "support"],
};
