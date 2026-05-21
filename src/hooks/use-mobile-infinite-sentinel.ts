"use client";

import { useEffect, useRef } from "react";

/** Infinite scroll sentinel for mobile card lists (scroll root is app shell main). */
export function useMobileInfiniteSentinel(loadNext: () => void | Promise<void>) {
  const mobileSentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = mobileSentinelRef.current;
    if (!target) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadNext();
      },
      { rootMargin: "120px", threshold: 0 }
    );
    obs.observe(target);
    return () => obs.disconnect();
  }, [loadNext]);

  return mobileSentinelRef;
}
