import type { ReportsOverviewPayload } from "./types";

export function buildInsights(
  payload: ReportsOverviewPayload,
  hasCompare: boolean
): ReportsOverviewPayload["insights"] {
  const out: ReportsOverviewPayload["insights"] = [];
  const revenueKpi = payload.kpis.find((k) => k.key === "revenue");
  const winKpi = payload.kpis.find((k) => k.key === "quoteWinRate");
  const sla = payload.sections.support;
  const totalSla = sla.slaCompliant + sla.slaBreached;

  if (hasCompare && revenueKpi?.deltaPct != null) {
    const d = revenueKpi.deltaPct;
    if (d >= 10) {
      out.push({
        tone: "positive",
        textSq: `Xhiro u rrit ${d}% krahasuar me periudhën e mëparshme.`,
        textEn: `Revenue increased ${d}% compared to the previous period.`,
      });
    } else if (d <= -10) {
      out.push({
        tone: "negative",
        textSq: `Xhiro u ul ${Math.abs(d)}% krahasuar me periudhën e mëparshme.`,
        textEn: `Revenue decreased ${Math.abs(d)}% compared to the previous period.`,
      });
    }
  }

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
      textSq: `Segmenti më i madh i xhiros: ${topTier.tier}.`,
      textEn: `Largest revenue segment: ${topTier.tier}.`,
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
