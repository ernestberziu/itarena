"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const ctaBase =
  "group relative inline-flex cursor-pointer select-none items-center justify-center gap-2 overflow-hidden font-extrabold tracking-tight transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 motion-safe:active:scale-[0.98]";

const ctaVisual = cn(
  "text-white shadow-[0_8px_32px_-4px_hsl(var(--primary)/0.7),0_0_0_1px_hsl(var(--primary)/0.4)]",
  "bg-[linear-gradient(135deg,hsl(var(--primary))_0%,#2563eb_45%,#7c3aed_100%)]",
  "motion-safe:hover:scale-[1.04] motion-safe:hover:shadow-[0_12px_40px_-4px_hsl(var(--primary)/0.8),0_0_0_2px_rgba(255,255,255,0.25)_inset]",
  "before:pointer-events-none before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:bg-[linear-gradient(105deg,transparent_35%,rgba(255,255,255,0.22)_50%,transparent_65%)] motion-safe:hover:before:opacity-100"
);

const sizeStyles = {
  hero: cn(
    "w-full min-h-[3.25rem] rounded-full px-6 py-3 text-sm sm:w-auto md:min-h-[3.5rem] md:px-8 md:text-base gap-3"
  ),
  /** Same height as navbar `Button size="sm"` (h-9). */
  header: cn(
    "hidden md:inline-flex h-9 min-w-[8.5rem] shrink-0 rounded-full px-4 text-sm leading-none"
  ),
  /** Same as header Support ticket mobile row (min-h-11). */
  headerMobile: cn("w-full h-11 rounded-full px-6 text-sm leading-none"),
} as const;

const iconWrapStyles = {
  hero: "h-8 w-8 md:h-9 md:w-9",
  header: "h-5 w-5",
  headerMobile: "h-6 w-6",
} as const;

const arrowStyles = {
  hero: "h-4 w-4 md:h-5 md:w-5",
  header: "h-3 w-3",
  headerMobile: "h-3.5 w-3.5",
} as const;

export type MarketingPrimaryCtaSize = keyof typeof sizeStyles;

/** Same style as hero “Kërko Ofertë Falas” — gradient pill + arrow chip. */
export function MarketingPrimaryCta({
  href,
  children,
  size = "hero",
  className,
  onClick,
}: {
  href: string;
  children: ReactNode;
  size?: MarketingPrimaryCtaSize;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(ctaBase, ctaVisual, sizeStyles[size], className)}
    >
      <span
        className={cn(
          "relative z-10 flex items-center",
          size === "hero" ? "gap-3" : "gap-2"
        )}
      >
        <span>{children}</span>
        <span
          className={cn(
            "flex shrink-0 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/30 motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5",
            iconWrapStyles[size]
          )}
        >
          <ArrowRight
            className={arrowStyles[size]}
            strokeWidth={2.5}
            aria-hidden
          />
        </span>
      </span>
    </Link>
  );
}
