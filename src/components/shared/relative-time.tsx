"use client";

import { useEffect, useState } from "react";
import { formatDateTime, timeAgo } from "@/lib/utils";

function useRelativeLabel(date: Date | string): string | null {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    setLabel(timeAgo(date));
    const id = setInterval(() => setLabel(timeAgo(date)), 60_000);
    return () => clearInterval(id);
  }, [date]);

  return label;
}

/** Relative time only — after mount (avoids hydration mismatch). */
export function RelativeTime({
  date,
  className,
}: {
  date: Date | string;
  className?: string;
}) {
  const label = useRelativeLabel(date);
  if (!label) return null;
  return <span className={className}>{label}</span>;
}

/** e.g. `(4 minutes ago)` — after mount. */
export function RelativeTimeInParentheses({ date }: { date: Date | string }) {
  const label = useRelativeLabel(date);
  if (!label) return null;
  return <span>{` (${label})`}</span>;
}

/** e.g. `4 minutes ago · 20/05/2026 14:30` — absolute date on SSR, relative after mount. */
export function TimeAgoStamp({
  date,
  className,
}: {
  date: Date | string;
  className?: string;
}) {
  const d = typeof date === "string" ? new Date(date) : date;
  const label = useRelativeLabel(d);

  return (
    <time dateTime={d.toISOString()} className={className}>
      {label ? (
        <>
          {label}
          {" · "}
        </>
      ) : null}
      {formatDateTime(d)}
    </time>
  );
}
