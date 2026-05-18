import type { ReportsOverviewPayload } from "./types";

import { labelTier } from "./labels";

export function buildInsights(payload: ReportsOverviewPayload): ReportsOverviewPayload["insights"] {
  const out: ReportsOverviewPayload["insights"] = [];
  const winKpi = payload.kpis.find((k) => k.key === "quoteWinRate");
  const sla = payload.sections.support;
  const totalSla = sla.slaCompliant + sla.slaBreached;

  if (winKpi && winKpi.value >= 40) {
    out.push({
      tone: "positive",
      textSq: `Shkalla e pranimit të ofertave është ${winKpi.formatted} në këtë periudhë.`,
      textEn: `Quote win rate is ${winKpi.formatted} in this period.`,
    });
  }

  if (totalSla > 0) {
    const breachPct = Math.round((sla.slaBreached / totalSla) * 100);
    if (breachPct >= 20) {
      out.push({
        tone: "negative",
        textSq: `${breachPct}% e biletave të zgjidhura kanë shkelur SLA-n.`,
        textEn: `${breachPct}% of resolved tickets breached SLA.`,
      });
    } else {
      out.push({
        tone: "neutral",
        textSq: `Koha mesatare e zgjidhjes: ${sla.avgResolutionHours}h.`,
        textEn: `Average resolution time: ${sla.avgResolutionHours}h.`,
      });
    }
  }

  const topTier = payload.sections.revenue.byTier.sort((a, b) => b.total - a.total)[0];
  if (topTier && topTier.total > 0) {
    out.push({
      tone: "neutral",
      textSq: `Segmenti më i madh i xhiros: ${labelTier(topTier.tier, "sq")}.`,
      textEn: `Largest revenue segment: ${labelTier(topTier.tier, "en")}.`,
    });
  }

  const topSku = payload.sections.products.topSkus[0];
  if (topSku) {
    out.push({
      tone: "neutral",
      textSq: `Produkti më i shitur: ${topSku.name} (${topSku.sku}).`,
      textEn: `Top product: ${topSku.name} (${topSku.sku}).`,
    });
  }

  return out.slice(0, 6);
}
