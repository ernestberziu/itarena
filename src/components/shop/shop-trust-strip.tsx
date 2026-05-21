import { Truck, CreditCard, Shield, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type ShopLang = "sq" | "en";

type TrustFeature = {
  icon: LucideIcon;
  label: string;
  desc: string;
  accent: "blue" | "amber" | "emerald";
};

const TRUST_FEATURES: Record<ShopLang, TrustFeature[]> = {
  sq: [
    {
      icon: Truck,
      label: "Dorëzim 24–48h",
      desc: "Në të gjithë Shqipërinë",
      accent: "blue",
    },
    {
      icon: CreditCard,
      label: "Pagesë me Dorëzim",
      desc: "Pagoni vetëm kur merrni",
      accent: "amber",
    },
    {
      icon: Shield,
      label: "Garanci Zyrtare",
      desc: "Produkte origjinale",
      accent: "emerald",
    },
  ],
  en: [
    {
      icon: Truck,
      label: "24–48h Delivery",
      desc: "Across Albania",
      accent: "blue",
    },
    {
      icon: CreditCard,
      label: "Cash on Delivery",
      desc: "Pay only when you receive",
      accent: "amber",
    },
    {
      icon: Shield,
      label: "Official Warranty",
      desc: "Original products",
      accent: "emerald",
    },
  ],
};

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
  lang: ShopLang;
  className?: string;
  /** Tighter padding when nested under the shop hero */
  compact?: boolean;
}

export function ShopTrustStrip({ lang, className, compact }: ShopTrustStripProps) {
  const features = TRUST_FEATURES[lang];

  return (
    <div
      className={cn(
        compact ? "pt-8 md:pt-10" : "py-8 md:py-10",
        className
      )}
      aria-label={lang === "sq" ? "Përfitimet e blerjes" : "Shopping benefits"}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        {features.map((f) => {
          const accent = accentStyles[f.accent];
          const Icon = f.icon;
          return (
            <div
              key={f.label}
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
                  {f.label}
                </p>
                <p className="text-xs md:text-[0.8125rem] text-slate-400 mt-1 leading-relaxed">
                  {f.desc}
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
