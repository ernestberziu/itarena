"use client";

import * as React from "react";

const POLL_MS = 45_000;

type NotificationCountContextValue = {
  count: number;
  refresh: () => Promise<void>;
};

const NotificationCountContext = React.createContext<NotificationCountContextValue | null>(
  null
);

export function NotificationCountProvider({
  initialCount,
  children,
}: {
  initialCount: number;
  children: React.ReactNode;
}) {
  const [count, setCount] = React.useState(initialCount);
  const prevRef = React.useRef(initialCount);

  React.useEffect(() => {
    setCount(initialCount);
    prevRef.current = initialCount;
  }, [initialCount]);

  const refresh = React.useCallback(async () => {
    try {
      const res = await fetch("/api/notifications/unread-count", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { count?: number };
      const next = typeof data.count === "number" ? data.count : 0;
      setCount(next);
      prevRef.current = next;
    } catch {
      // ignore network errors during background poll
    }
  }, []);

  React.useEffect(() => {
    const tick = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    tick();
    const id = window.setInterval(tick, POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  const value = React.useMemo(() => ({ count, refresh }), [count, refresh]);

  return (
    <NotificationCountContext.Provider value={value}>
      {children}
    </NotificationCountContext.Provider>
  );
}

export function useNotificationCount(fallback = 0): number {
  const ctx = React.useContext(NotificationCountContext);
  return ctx?.count ?? fallback;
}

export function useRefreshNotifications(): (() => Promise<void>) | undefined {
  return React.useContext(NotificationCountContext)?.refresh;
}
