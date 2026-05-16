import type { ReportsOverviewPayload, ReportSectionId } from "./types";

export function sectionToRows(
  section: ReportSectionId,
  data: ReportsOverviewPayload
): { columns: { key: string; header: string }[]; rows: Record<string, unknown>[] } {
  switch (section) {
    case "revenue":
      return {
        columns: [
          { key: "date", header: "Date" },
          { key: "total", header: "Revenue (ALL)" },
        ],
        rows: data.sections.revenue.dailyRevenue.map((r) => ({
          date: r.date,
          total: r.value,
        })),
      };
    case "users":
      return {
        columns: [
          { key: "name", header: "Company" },
          { key: "revenue", header: "Revenue" },
          { key: "orders", header: "Orders" },
        ],
        rows: data.sections.users.topCompanies.map((c) => ({ ...c })),
      };
    case "quotes":
      return {
        columns: [
          { key: "status", header: "Status" },
          { key: "count", header: "Count" },
        ],
        rows: data.sections.quotes.byStatus.map((s) => ({ ...s })),
      };
    case "products":
      return {
        columns: [
          { key: "sku", header: "SKU" },
          { key: "name", header: "Name" },
          { key: "quantity", header: "Qty" },
          { key: "revenue", header: "Revenue" },
        ],
        rows: data.sections.products.topSkus.map((s) => ({ ...s })),
      };
    case "funnel":
      return {
        columns: [
          { key: "stage", header: "Stage" },
          { key: "count", header: "Count" },
        ],
        rows: data.sections.funnel.stages.map((s) => ({ ...s })),
      };
    case "support":
      return {
        columns: [
          { key: "action", header: "Action" },
          { key: "count", header: "Count" },
        ],
        rows: data.sections.support.auditByAction.map((a) => ({ ...a })),
      };
    case "overview":
    default:
      return {
        columns: [
          { key: "metric", header: "Metric" },
          { key: "value", header: "Value" },
        ],
        rows: data.kpis.map((k) => ({ metric: k.key, value: k.formatted })),
      };
  }
}
