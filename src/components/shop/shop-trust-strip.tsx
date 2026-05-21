"use client";

import { Truck, CreditCard, Shield, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

type TrustFeature = {
  icon: LucideIcon;
  labelKey: "trustDeliveryLabel" | "trustCodLabel" | "trustWarrantyLabel";
  descKey: "trustDeliveryDesc" | "trustCodDesc" | "trustWarrantyDesc";
  accent: "blue" | "amber" | "emerald";
};

const TRUST_FEATURES: TrustFeature[] = [
  { icon: Truck, labelKey: "trustDeliveryLabel", descKey: "trustDeliveryDesc", accent: "blue" },
  { icon: CreditCard, labelKey: "trustCodLabel", descKey: "trustCodDesc", accent: "amber" },
  { icon: Shield, labelKey: "trustWarrantyLabel", descKey: "trustWarrantyDesc", accent: "emerald" },
];

const accentStyles = {
  blue: {
    card: "hover:border-blue-500/30",
    iconWrap: "bg-blue-500/15 border-blue-400/25 shadow-[0_0_24px_-8px_rgba(59,130,246,0.45)]",
    icon: "text-blue-400",
    dot: "bg-blue-400",
  },
  amber: {
    card: "hover:border-amber-500/30",
    iconWrap: "bg-amber-500/15 border-amber-400/25 shadow-[0_0_24px_-8px_rgba(245,158,11,0.4)]",
    icon: "text-amber-400",
    dot: "bg-amber-400",
  },
  emerald: {
    card: "hover:border-emerald-500/30",
    iconWrap: "bg-emerald-500/15 border-emerald-400/25 shadow-[0_0_24px_-8px_rgba(16,185,129,0.4)]",
    icon: "text-emerald-400",
    dot: "bg-emerald-400",
  },
} as const;

interface ShopTrustStripProps {
  className?: string;
  /** Tighter padding when nested under the shop hero */
  compact?: boolean;
}

export function ShopTrustStrip({ className, compact }: ShopTrustStripProps) {
  const t = useTranslations("shop");

  return (
    <div
      className={cn(compact ? "pt-8 md:pt-10" : "py-8 md:py-10", className)}
      aria-label={t("trustAriaLabel")}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        {TRUST_FEATURES.map((f) => {
          const accent = accentStyles[f.accent];
          const Icon = f.icon;
          const label = t(f.labelKey);
          return (
            <div
              key={f.labelKey}
              className={cn(
                "group relative flex items-center gap-4 rounded-2xl border border-white/10",
                "bg-gradient-to-br from-white/[0.06] to-white/[0.02] px-4 py-4 md:px-5 md:py-5",
                "transition-[border-color,background-color,transform] duration-200",
                "hover:bg-white/[0.08] motion-safe:hover:-translate-y-0.5",
                accent.card
              )}
            >
              <div
                className={cn(
                  "flex h-11 w-11 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-xl border",
                  accent.iconWrap
                )}
              >
                <Icon className={cn("h-5 w-5 md:h-[1.35rem] md:w-[1.35rem]", accent.icon)} strokeWidth={1.75} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm md:text-[0.9375rem] text-white leading-snug tracking-tight">
                  {label}
                </p>
                <p className="text-xs md:text-[0.8125rem] text-slate-400 mt-1 leading-relaxed">
                  {t(f.descKey)}
                </p>
              </div>
              <span
                className={cn(
                  "absolute top-3 right-3 h-1.5 w-1.5 rounded-full opacity-60 group-hover:opacity-100 transition-opacity",
                  accent.dot
                )}
                aria-hidden
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
