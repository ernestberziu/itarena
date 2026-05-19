"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { getLucideIcon } from "@/lib/site-content/icons";
import { serviceName, serviceShortDesc } from "@/lib/site-content/locale";
import type { MarketingServiceRecord } from "@/lib/site-content/types";

type CardSize = "featured" | "standard" | "wide";

type ServiceTheme = {
  shell: string;
  title: string;
  desc: string;
  iconWrap: string;
  iconClass: string;
  cta: string;
  decor?: string;
  layout: "stack" | "horizontal" | "corner";
};

/** 4-col bento — 8 cards, zero holes:
 *  [ featured 2×2 ][ s1 ][ s2 ]
 *                 [ s3 ][ s4 ]
 *  [ s5 ][ s6 ][      wide s7      ]
 */
function getCardSize(index: number, total: number): CardSize {
  if (index === 0) return "featured";
  if (index === total - 1 && total >= 2) return "wide";
  return "standard";
}

function getGridClass(size: CardSize): string {
  switch (size) {
    case "featured":
      return "col-span-1 sm:col-span-2 lg:col-span-2 lg:row-span-2";
    case "wide":
      return "col-span-1 sm:col-span-2 lg:col-span-2";
    default:
      return "col-span-1";
  }
}

const SERVICE_THEMES: Record<string, ServiceTheme> = {
  "it-support": {
    shell:
      "bg-gradient-to-br from-blue-800 via-blue-900 to-slate-950 text-white border-blue-600/30 shadow-xl shadow-blue-950/30",
    title: "text-2xl font-black leading-tight text-white sm:text-3xl lg:text-[2rem]",
    desc: "text-sm leading-relaxed text-blue-100/90 sm:text-base",
    iconWrap: "h-14 w-14 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md",
    iconClass: "text-white",
    cta: "text-white font-bold",
    decor: "bg-[radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.16),transparent_50%)]",
    layout: "stack",
  },
  cloud: {
    shell:
      "bg-gradient-to-br from-sky-300 via-sky-400 to-blue-500 text-white border-sky-200/50 shadow-lg shadow-sky-500/25 rounded-3xl",
    title: "text-lg font-extrabold leading-snug text-white sm:text-xl",
    desc: "text-sm leading-relaxed text-sky-50",
    iconWrap: "h-12 w-12 rounded-full bg-white/25 ring-4 ring-white/30",
    iconClass: "text-white",
    cta: "text-white font-bold text-sm",
    layout: "corner",
  },
  "cctv-siguri": {
    shell:
      "bg-[#111114] text-white border-rose-500/40 shadow-[0_0_0_1px_rgba(244,63,94,0.25),0_16px_40px_-12px_rgba(0,0,0,0.5)]",
    title: "text-base font-extrabold uppercase tracking-wide text-rose-50 sm:text-lg",
    desc: "text-sm leading-relaxed text-rose-200/80",
    iconWrap: "h-11 w-11 rounded-lg border border-rose-500/40 bg-rose-500/15",
    iconClass: "text-rose-400",
    cta: "text-rose-300 font-bold text-xs uppercase tracking-widest",
    layout: "stack",
  },
  "web-marketing": {
    shell:
      "bg-white border-2 border-violet-200 shadow-md bg-[radial-gradient(ellipse_at_top_right,#ede9fe,transparent_55%),linear-gradient(135deg,#faf5ff,#fff)]",
    title:
      "text-base font-extrabold bg-gradient-to-r from-violet-700 to-fuchsia-600 bg-clip-text text-transparent sm:text-lg",
    desc: "text-sm leading-relaxed text-violet-900/75 font-medium",
    iconWrap: "h-11 w-11 rounded-xl bg-violet-600 shadow-lg shadow-violet-500/30",
    iconClass: "text-white",
    cta: "text-violet-700 font-bold text-sm",
    layout: "stack",
  },
  rrjet: {
    shell:
      "bg-emerald-950 text-emerald-50 border-emerald-500/35 before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(rgba(16,185,129,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.07)_1px,transparent_1px)] before:bg-[size:20px_20px]",
    title: "text-base font-extrabold text-emerald-50 sm:text-lg",
    desc: "text-sm leading-relaxed text-emerald-200/85 relative z-10",
    iconWrap:
      "h-11 w-11 rounded-lg border border-emerald-400/30 bg-emerald-500/20 relative z-10",
    iconClass: "text-emerald-300",
    cta: "text-emerald-300 font-bold text-sm relative z-10",
    layout: "stack",
  },
  software: {
    shell:
      "bg-[#1c1408] border-2 border-amber-500/45 shadow-[inset_0_1px_0_rgba(251,191,36,0.12)] font-mono",
    title: "text-base font-bold text-amber-300 sm:text-lg",
    desc: "text-sm leading-relaxed text-amber-100/75 font-sans",
    iconWrap: "h-11 w-11 rounded-md border border-amber-500/35 bg-amber-500/10",
    iconClass: "text-amber-400",
    cta: "text-amber-400 font-bold font-sans text-sm",
    layout: "corner",
  },
  telekomunikacion: {
    shell:
      "bg-gradient-to-br from-indigo-600 to-indigo-900 text-white border-indigo-400/30 shadow-lg shadow-indigo-900/30",
    title: "text-base font-extrabold text-white sm:text-lg",
    desc: "text-sm leading-relaxed text-indigo-100/90",
    iconWrap: "h-11 w-11 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20",
    iconClass: "text-white",
    cta: "text-indigo-100 font-bold text-sm",
    layout: "stack",
  },
  printere: {
    shell:
      "bg-gradient-to-r from-orange-50 via-white to-amber-50 border-[3px] border-orange-400 shadow-[6px_6px_0_0_rgba(251,146,60,0.3)]",
    title: "text-lg font-black text-orange-950 sm:text-xl",
    desc: "text-sm leading-relaxed text-orange-900/80 font-medium sm:text-base",
    iconWrap: "h-12 w-12 rounded-xl bg-orange-500 shadow-md",
    iconClass: "text-white",
    cta: "text-orange-700 font-extrabold text-sm",
    layout: "horizontal",
  },
};

const FALLBACK_THEMES: ServiceTheme[] = Object.values(SERVICE_THEMES);

function getTheme(slug: string, index: number): ServiceTheme {
  return SERVICE_THEMES[slug] ?? FALLBACK_THEMES[index % FALLBACK_THEMES.length]!;
}

function CardBody({
  theme,
  Icon,
  title,
  desc,
  learnMore,
  size,
}: {
  theme: ServiceTheme;
  Icon: LucideIcon;
  title: string;
  desc: string;
  learnMore: string;
  size: CardSize;
}) {
  const iconSize = size === "featured" ? "h-7 w-7" : "h-5 w-5 sm:h-6 sm:w-6";

  if (theme.layout === "horizontal" || size === "wide") {
    return (
      <div className="relative z-10 flex h-full flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="flex min-w-0 flex-1 gap-4">
          <div className={cn("flex shrink-0 items-center justify-center", theme.iconWrap)}>
            <Icon className={cn(iconSize, theme.iconClass)} strokeWidth={2} aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className={theme.title}>{title}</h3>
            <p className={cn("mt-2", theme.desc)}>{desc}</p>
          </div>
        </div>
        <span className={cn("inline-flex shrink-0 items-center gap-1.5 self-start", theme.cta)}>
          {learnMore}
          <ArrowRight className="h-4 w-4 motion-safe:transition-transform motion-safe:group-hover:translate-x-1" />
        </span>
      </div>
    );
  }

  if (theme.layout === "corner") {
    return (
      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className={cn("flex items-center justify-center", theme.iconWrap)}>
            <Icon className={cn(iconSize, theme.iconClass)} strokeWidth={2} aria-hidden />
          </div>
          <ArrowUpRight
            className="h-5 w-5 shrink-0 opacity-50 motion-safe:transition-all motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:opacity-100"
            aria-hidden
          />
        </div>
        <h3 className={cn("mt-5", theme.title)}>{title}</h3>
        <p className={cn("mt-2 flex-1", theme.desc)}>{desc}</p>
        <span className={cn("mt-4 inline-flex items-center gap-1.5", theme.cta)}>
          {learnMore}
          <ArrowRight className="h-4 w-4 motion-safe:transition-transform motion-safe:group-hover:translate-x-1" />
        </span>
      </div>
    );
  }

  return (
    <div className="relative z-10 flex h-full flex-col">
      <div className={cn("mb-4 flex items-center justify-center self-start", theme.iconWrap)}>
        <Icon className={cn(iconSize, theme.iconClass)} strokeWidth={2} aria-hidden />
      </div>
      <h3 className={theme.title}>{title}</h3>
      <p className={cn("mt-2 flex-1", theme.desc)}>{desc}</p>
      <span className={cn("mt-4 inline-flex items-center gap-1.5", theme.cta)}>
        {learnMore}
        <ArrowRight className="h-4 w-4 motion-safe:transition-transform motion-safe:group-hover:translate-x-1" />
      </span>
    </div>
  );
}

export function HomeServiceCard({
  svc,
  locale,
  lp,
  index,
  total,
}: {
  svc: MarketingServiceRecord;
  locale: string;
  lp: string;
  index: number;
  total: number;
}) {
  const Icon = getLucideIcon(svc.iconKey);
  const size = getCardSize(index, total);
  const theme = getTheme(svc.slug, index);
  const learnMore = locale === "sq" ? "Mëso më shumë" : "Learn more";
  const title = serviceName(svc, locale);
  const desc = serviceShortDesc(svc, locale);

  const padding =
    size === "featured" ? "p-6 sm:p-7 lg:p-8" : size === "wide" ? "p-5 sm:p-6" : "p-5 sm:p-6";

  return (
    <Link href={`${lp}/sherbime/${svc.slug}`} className={cn("group flex min-h-0", getGridClass(size))}>
      <article
        className={cn(
          "relative flex h-full w-full flex-col overflow-hidden rounded-2xl border transition-all duration-300 motion-safe:hover:-translate-y-0.5",
          padding,
          theme.shell,
          size === "featured" && "motion-safe:hover:shadow-2xl",
          size !== "featured" && "motion-safe:hover:shadow-lg"
        )}
      >
        {theme.decor && (
          <div className={cn("pointer-events-none absolute inset-0", theme.decor)} aria-hidden />
        )}

        {size === "featured" && theme.layout === "stack" ? (
          <div className="relative z-10 flex h-full flex-col">
            <div className="mb-5 flex items-start gap-3">
              <div className={cn("flex items-center justify-center", theme.iconWrap)}>
                <Icon className={cn("h-7 w-7", theme.iconClass)} strokeWidth={2} aria-hidden />
              </div>
            </div>
            <h3 className={theme.title}>{title}</h3>
            <p className={cn("mt-3 flex-1", theme.desc)}>{desc}</p>
            <span className={cn("mt-6 inline-flex items-center gap-2", theme.cta)}>
              {learnMore}
              <ArrowRight className="h-4 w-4 motion-safe:transition-transform motion-safe:group-hover:translate-x-1" />
            </span>
          </div>
        ) : (
          <CardBody
            theme={theme}
            Icon={Icon}
            title={title}
            desc={desc}
            learnMore={learnMore}
            size={size}
          />
        )}
      </article>
    </Link>
  );
}
