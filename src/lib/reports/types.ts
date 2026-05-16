export type ReportDatePresetId =
  | "today"
  | "yesterday"
  | "last7"
  | "last30"
  | "last90"
  | "thisMonth"
  | "lastMonth"
  | "thisQuarter"
  | "thisYear"
  | "custom";

export type ReportRange = {
  from: string;
  to: string;
  tz: string;
  preset?: ReportDatePresetId;
};

export type DailyPoint = { date: string; value: number };

export type KpiKey =
  | "revenue"
  | "orders"
  | "aov"
  | "revenueGrowth"
  | "newCustomers"
  | "activeCustomers"
  | "returningCustomers"
  | "quotePipeline"
  | "quoteWinRate"
  | "ticketsResolved";

export type KpiCard = {
  key: KpiKey;
  value: number;
  formatted: string;
  deltaPct: number | null;
  sparkline: DailyPoint[];
};

export type ReportsOverviewPayload = {
  range: ReportRange;
  previousRange: ReportRange | null;
  kpis: KpiCard[];
  insights: { tone: "positive" | "negative" | "neutral"; textSq: string; textEn: string }[];
  sections: {
    revenue: RevenueSection;
    users: UsersSection;
    quotes: QuotesSection;
    products: ProductsSection;
    funnel: FunnelSection;
    support: SupportSection;
  };
  generatedAt: string;
};

export type RevenueSection = {
  dailyRevenue: DailyPoint[];
  byStatus: { status: string; count: number; total: number }[];
  byTier: { tier: string; total: number }[];
  cancelledCount: number;
  completedCount: number;
};

export type UsersSection = {
  dailySignups: DailyPoint[];
  newCustomers: number;
  returningCustomers: number;
  topCompanies: { name: string; revenue: number; orders: number }[];
  byCountry: { country: string; count: number }[];
};

export type QuotesSection = {
  byStatus: { status: string; count: number }[];
  funnel: { stage: string; count: number }[];
  avgResponseHours: number | null;
  pipelineCount: number;
  pipelineValue: number;
};

export type ProductsSection = {
  topSkus: { sku: string; name: string; quantity: number; revenue: number }[];
};

export type FunnelSection = {
  stages: { stage: string; count: number }[];
};

export type SupportSection = {
  ticketsOpenedDaily: DailyPoint[];
  ticketsResolvedDaily: DailyPoint[];
  slaCompliant: number;
  slaBreached: number;
  avgResolutionHours: number;
  auditByAction: { action: string; count: number }[];
};

export type ReportSectionId =
  | "revenue"
  | "users"
  | "quotes"
  | "products"
  | "funnel"
  | "support"
  | "overview";
