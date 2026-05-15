import { cn } from "@/lib/utils";

type Variant = "light" | "dark" | "blue";
type Size = "xs" | "sm" | "md" | "lg" | "xl";

interface ItArenaLogoProps {
  variant?: Variant;
  size?: Size;
  showTagline?: boolean;
  className?: string;
  /** When true, renders only the mark (dots + pill), no wordmark */
  markOnly?: boolean;
}

const sizeMap: Record<Size, { mark: number; arena: number; tagline: number; gap: number }> = {
  xs: { mark: 20, arena: 12, tagline: 8,  gap: 4  },
  sm: { mark: 28, arena: 16, tagline: 10, gap: 6  },
  md: { mark: 36, arena: 22, tagline: 12, gap: 8  },
  lg: { mark: 48, arena: 30, tagline: 14, gap: 10 },
  xl: { mark: 64, arena: 40, tagline: 18, gap: 14 },
};

/**
 * Official IT Arena logo mark + wordmark.
 *
 * Mark structure (from the brand PDF):
 *  - Three circles at top: [charcoal] [cobalt-blue] [charcoal]
 *  - A rounded pill below the center circle in cobalt-blue = the body of the letter "i"
 * Wordmark: bold lowercase "arena" in cobalt-blue
 * Tagline (optional): "Technology & Service" in gray
 *
 * Variant   Background    Mark colors
 * --------  ----------    -----------
 * light     white/light   charcoal dots, cobalt blue center+pill, cobalt wordmark
 * dark      dark/navy     white dots, cobalt blue center+pill, white wordmark
 * blue      cobalt blue   white dots+pill, white wordmark
 */
export function ItArenaLogo({
  variant = "light",
  size = "md",
  showTagline = false,
  className,
  markOnly = false,
}: ItArenaLogoProps) {
  const s = sizeMap[size];

  // Color definitions per variant
  const outerDot  = variant === "light" ? "#2D2D38" : "#FFFFFF";
  const centerDot = variant === "blue"  ? "#FFFFFF" : "#1400D4";
  const pill      = variant === "blue"  ? "#FFFFFF" : "#1400D4";
  const wordmark  = variant === "light" ? "#1400D4" : "#FFFFFF";
  const taglineColor = variant === "light" ? "#6B7280" : "rgba(255,255,255,0.65)";

  // SVG geometry (all relative to mark size m)
  const m = s.mark;
  const dotR  = m * 0.13;   // radius of each dot
  const dotY  = dotR;        // top of dot area
  const dotCY = dotR;        // center Y of dots
  // x-positions of the three dot centers
  const dotSpacing = m * 0.36;
  const cx = m / 2;
  const leftCX  = cx - dotSpacing;
  const rightCX = cx + dotSpacing;

  // Pill dimensions
  const pillW  = m * 0.24;
  const pillH  = m * 0.52;
  const pillX  = cx - pillW / 2;
  const pillY  = dotCY + dotR + m * 0.06;
  const pillRX = pillW / 2;

  // Total SVG height for the mark
  const markH = pillY + pillH;

  if (markOnly) {
    return (
      <svg
        width={m}
        height={Math.round(markH)}
        viewBox={`0 0 ${m} ${Math.round(markH)}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="IT Arena"
      >
        <circle cx={leftCX}  cy={dotCY} r={dotR} fill={outerDot} />
        <circle cx={cx}      cy={dotCY} r={dotR} fill={centerDot} />
        <circle cx={rightCX} cy={dotCY} r={dotR} fill={outerDot} />
        <rect x={pillX} y={pillY} width={pillW} height={pillH} rx={pillRX} fill={pill} />
      </svg>
    );
  }

  const arenaFontSize = s.arena;
  const taglineFontSize = s.tagline;
  const gap = s.gap;

  return (
    <div className={cn("flex items-center", className)} style={{ gap }}>
      {/* Mark */}
      <svg
        width={m}
        height={Math.round(markH)}
        viewBox={`0 0 ${m} ${Math.round(markH)}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ flexShrink: 0 }}
      >
        <circle cx={leftCX}  cy={dotCY} r={dotR} fill={outerDot} />
        <circle cx={cx}      cy={dotCY} r={dotR} fill={centerDot} />
        <circle cx={rightCX} cy={dotCY} r={dotR} fill={outerDot} />
        <rect x={pillX} y={pillY} width={pillW} height={pillH} rx={pillRX} fill={pill} />
      </svg>

      {/* Wordmark */}
      <div className="flex flex-col leading-none" style={{ gap: showTagline ? 2 : 0 }}>
        <span
          style={{
            fontSize: arenaFontSize,
            fontWeight: 800,
            color: wordmark,
            letterSpacing: "-0.01em",
            lineHeight: 1,
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          }}
        >
          arena
        </span>
        {showTagline && (
          <span
            style={{
              fontSize: taglineFontSize,
              fontWeight: 400,
              color: taglineColor,
              letterSpacing: "0.04em",
              lineHeight: 1,
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            }}
          >
            Technology &amp; Service
          </span>
        )}
      </div>
    </div>
  );
}
