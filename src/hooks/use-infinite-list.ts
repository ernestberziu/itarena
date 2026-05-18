"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PaginatedListResponse } from "@/lib/admin-list-pagination";

export type UseInfiniteListOptions<T> = {
  initialItems: T[];
  totalCount: number;
  pageSize: number;
  filterQuery: string;
  fetchUrl: string;
  getRowId: (row: T) => string;
  locale?: string;
};

export function useInfiniteList<T>({
  initialItems,
  totalCount,
  pageSize,
  filterQuery,
  fetchUrl,
  getRowId,
  locale = "sq",
}: UseInfiniteListOptions<T>) {
  const [rows, setRows] = useState<T[]>(initialItems);
  const [hasMore, setHasMore] = useState(initialItems.length < totalCount);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pageRef = useRef(1);
  const hasMoreRef = useRef(hasMore);
  const loadingRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  useEffect(() => {
    pageRef.current = 1;
    setRows(initialItems);
    setHasMore(initialItems.length < totalCount);
    setError(null);
  }, [initialItems, totalCount, filterQuery]);

  const loadNext = useCallback(async () => {
    if (loadingRef.current || !hasMoreRef.current) return;
    loadingRef.current = true;
    setLoadingMore(true);
    setError(null);
    const nextPage = pageRef.current + 1;
    try {
      const qs = new URLSearchParams(filterQuery);
      qs.set("page", String(nextPage));
      qs.set("pageSize", String(pageSize));
      const res = await fetch(`${fetchUrl}?${qs.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as PaginatedListResponse<T>;
      setRows((prev) => {
        const seen = new Set(prev.map(getRowId));
        const merged = [...prev];
        for (const row of data.items) {
          const id = getRowId(row);
          if (!seen.has(id)) {
            seen.add(id);
            merged.push(row);
          }
        }
        return merged;
      });
      pageRef.current = nextPage;
      hasMoreRef.current = data.hasMore;
      setHasMore(data.hasMore);
    } catch {
      setError(locale === "sq" ? "Ngarkimi dështoi" : "Failed to load more");
    } finally {
      loadingRef.current = false;
      setLoadingMore(false);
    }
  }, [filterQuery, pageSize, fetchUrl, getRowId, locale]);

  useEffect(() => {
    const root = scrollRef.current;
    const target = sentinelRef.current;
    if (!root || !target) return;

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadNext();
      },
      { root, rootMargin: "120px", threshold: 0 }
    );
    obs.observe(target);
    return () => obs.disconnect();
  }, [loadNext]);

  return {
    rows,
    hasMore,
    loadingMore,
    error,
    scrollRef,
    sentinelRef,
    loadedCount: rows.length,
    loadNext,
  };
}
