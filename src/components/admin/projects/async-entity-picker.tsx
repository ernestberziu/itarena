"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProjectLookupItem } from "@/lib/projects/lookup-types";

type Labels = {
  placeholder: string;
  empty: string;
  loading: string;
  error: string;
  minChars?: string;
};

export function AsyncEntityPicker({
  fetchUrl,
  labels,
  onSelect,
  disabled,
  clearOnSelect = true,
  className,
  queryParams,
}: {
  fetchUrl: string;
  labels: Labels;
  onSelect: (item: ProjectLookupItem) => void;
  disabled?: boolean;
  clearOnSelect?: boolean;
  className?: string;
  queryParams?: Record<string, string>;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProjectLookupItem[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setResults([]);
      setStatus("idle");
      return;
    }
    debounceRef.current = setTimeout(() => void runSearch(query), 220);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, open, fetchUrl]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  async function runSearch(q: string) {
    setStatus("loading");
    try {
      const p = new URLSearchParams({ q: q.trim(), ...queryParams });
      const res = await fetch(`${fetchUrl}?${p.toString()}`);
      if (!res.ok) throw new Error();
      const data = (await res.json()) as ProjectLookupItem[];
      setResults(data);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  function pick(item: ProjectLookupItem) {
    onSelect(item);
    if (clearOnSelect) setQuery("");
    setOpen(false);
  }

  const showDropdown = open && !disabled;
  const tooShort = query.trim().length > 0 && query.trim().length < 2;

  return (
    <div ref={wrapRef} className={cn("relative min-w-0 flex-1", className)}>
      <div
        className={cn(
          "flex items-center gap-2 rounded-xl border border-border/70 bg-white px-3 py-2.5 shadow-sm transition-colors dark:bg-white",
          "focus-within:border-border focus-within:ring-2 focus-within:ring-ring/25",
          disabled && "pointer-events-none opacity-50"
        )}
      >
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={2} aria-hidden />
        <input
          type="search"
          value={query}
          disabled={disabled}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          placeholder={labels.placeholder}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          autoComplete="off"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Clear"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
        {status === "loading" ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
        ) : null}
      </div>

      {showDropdown ? (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-64 overflow-y-auto rounded-xl border border-border/80 bg-white py-1 shadow-xl ring-1 ring-black/[0.06] dark:bg-white">
          {tooShort ? (
            <p className="px-3 py-4 text-center text-xs text-muted-foreground">
              {labels.minChars ?? "Type at least 2 characters"}
            </p>
          ) : null}
          {status === "error" ? (
            <p className="px-3 py-4 text-center text-xs text-destructive">{labels.error}</p>
          ) : null}
          {status === "loading" && !tooShort ? (
            <div className="flex items-center justify-center gap-2 py-8 text-xs text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {labels.loading}
            </div>
          ) : null}
          {status === "idle" && !tooShort && results.length === 0 && query.trim().length >= 2 ? (
            <p className="px-3 py-4 text-center text-xs text-muted-foreground">{labels.empty}</p>
          ) : null}
          {status === "idle" && results.length > 0 ? (
            <ul className="p-1">
              {results.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => pick(item)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-slate-50 active:bg-slate-100"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{item.label}</p>
                      {item.sublabel ? (
                        <p className="truncate text-xs text-muted-foreground">{item.sublabel}</p>
                      ) : null}
                    </div>
                    {item.meta ? (
                      <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        {item.meta}
                      </span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
