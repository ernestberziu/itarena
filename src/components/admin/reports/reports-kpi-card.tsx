"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Line, LineChart, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import type { KpiCard } from "@/lib/reports/types";
import { getKpiLabel } from "@/lib/reports/labels";

function useAnimatedNumber(target: number, duration = 700) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setN(from + (target - from) * p);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return n;
}

export function ReportsKpiCard({ kpi, locale }: { kpi: KpiCard; locale: string }) {
  const en = locale === "en";
  const label = getKpiLabel(kpi.key, en ? "en" : "sq");
  const animated = useAnimatedNumber(typeof kpi.value === "number" ? kpi.value : 0);
  const display =
    kpi.key === "revenue" || kpi.key === "aov"
      ? kpi.formatted
        : kpi.key === "quoteWinRate"
        ? kpi.formatted
        : String(Math.round(animated));

  const delta = kpi.deltaPct;
  const positive = delta != null && delta >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/50 p-4",
        "bg-[var(--admin-card-surface,hsl(var(--card)))] shadow-[var(--admin-shadow-sm)]",
        "ring-1 ring-black/[0.03] transition-shadow duration-300 hover:shadow-md dark:ring-white/[0.05]"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {delta != null ? (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-semibold",
              positive ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
            )}
          >
            {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {delta > 0 ? "+" : ""}
            {delta}%
          </span>
        ) : null}
      </div>
      <p className="admin-stat-value mt-2 text-lg font-bold tabular-nums leading-snug tracking-tight">{display}</p>
      <div className="mt-3 h-10 opacity-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={kpi.sparkline}>
            <Line type="monotone" dataKey="value" stroke="hsl(246,100%,42%)" strokeWidth={1.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
