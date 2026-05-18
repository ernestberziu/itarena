"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpen, Loader2, PackageSearch, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { CatalogSearchItem } from "@/app/api/admin/templates/catalog-search/route";

type Props = {
  onSelect: (item: CatalogSearchItem) => void;
  labels: {
    trigger: string;
    placeholder: string;
    empty: string;
    loading: string;
    error: string;
    unit: string;
  };
};

export function CatalogProductPicker({ onSelect, labels }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CatalogSearchItem[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setStatus("idle");
      return;
    }
    setTimeout(() => inputRef.current?.focus(), 80);
    void search("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => void search(query), 220);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  async function search(q: string) {
    setStatus("loading");
    try {
      const res = await fetch(
        `/api/admin/templates/catalog-search?q=${encodeURIComponent(q)}`
      );
      if (!res.ok) throw new Error();
      const data = (await res.json()) as CatalogSearchItem[];
      setResults(data);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  function pick(item: CatalogSearchItem) {
    onSelect(item);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button type="button" size="sm" variant="outline" className="gap-1.5" />
        }
      >
        <BookOpen className="h-3.5 w-3.5" />
        {labels.trigger}
      </DialogTrigger>

      <DialogContent
        className="bg-white p-0 sm:max-w-lg dark:bg-white"
        showCloseButton={false}
      >
        {/* Header */}
        <DialogHeader className="border-b border-slate-100 px-5 pt-5 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                <PackageSearch className="h-4 w-4 text-slate-600" />
              </div>
              <DialogTitle className="text-sm font-semibold text-slate-800">
                {labels.trigger}
              </DialogTitle>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Search input */}
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-slate-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-100">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={labels.placeholder}
              className="flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-slate-400 transition-colors hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </DialogHeader>

        {/* Results list */}
        <div className="max-h-80 overflow-y-auto">
          {status === "loading" && (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-sm text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>{labels.loading}</span>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center justify-center gap-1 py-12">
              <p className="text-sm font-medium text-red-500">{labels.error}</p>
            </div>
          )}

          {status === "idle" && results.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-slate-400">
              <PackageSearch className="h-8 w-8 opacity-40" />
              <p className="text-sm">{labels.empty}</p>
            </div>
          )}

          {status === "idle" && results.length > 0 && (
            <ul className="divide-y divide-slate-50 px-2 py-2">
              {results.map((item) => (
                <li key={item.kod}>
                  <button
                    type="button"
                    onClick={() => pick(item)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors",
                      "hover:bg-slate-50 active:bg-slate-100"
                    )}
                  >
                    {/* Icon */}
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500">
                      <PackageSearch className="h-3.5 w-3.5" />
                    </div>

                    {/* Name + code */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800 leading-tight">
                        {item.name}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {item.kod}
                        {item.unit ? ` · ${item.unit}` : ""}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold tabular-nums text-slate-800">
                        {item.price.toLocaleString("sq-AL", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                      {item.vatRate > 0 && (
                        <p className="mt-0.5 text-[11px] text-slate-400">
                          +{item.vatRate}% {labels.unit}
                        </p>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer count */}
        {status === "idle" && results.length > 0 && (
          <div className="border-t border-slate-100 px-5 py-3">
            <p className="text-xs text-slate-400">
              {results.length} {results.length === 1 ? "product" : "products"} found
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
