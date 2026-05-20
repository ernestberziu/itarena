"use client";

import { useEffect, useState } from "react";
import { ChevronsUpDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminWhiteInputClassName } from "@/components/admin/admin-white-dialog";
import type { CompanyLookupItem } from "@/types/admin-company";

export function AdminCompanyCombobox({
  locale,
  value,
  onChange,
}: {
  locale: string;
  value: string | null;
  onChange: (id: string | null) => void;
}) {
  const en = locale === "en";
  const t = (sq: string, e: string) => (en ? e : sq);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [items, setItems] = useState<CompanyLookupItem[]>([]);
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setLabel(null);
      return;
    }
    void fetch(`/api/admin/companies/lookup?limit=1&q=`)
      .then(() => null)
      .catch(() => null);
    void fetch(`/api/admin/companies/${value}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((c) => {
        if (c?.name) setLabel(c.name);
      })
      .catch(() => null);
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(async () => {
      const params = new URLSearchParams({ limit: "10" });
      if (q.trim()) params.set("q", q.trim());
      const res = await fetch(`/api/admin/companies/lookup?${params}`);
      if (res.ok) setItems(await res.json());
    }, 200);
    return () => clearTimeout(timer);
  }, [open, q]);

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        className="w-full justify-between bg-white dark:bg-white"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="truncate">{label || t("Zgjidh kompani...", "Select company...")}</span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
      </Button>
      {value && (
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="absolute right-10 top-1/2 h-7 w-7 -translate-y-1/2"
          onClick={() => onChange(null)}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-border bg-white p-2 shadow-lg dark:bg-white">
          <Input
            className={`mb-2 ${adminWhiteInputClassName}`}
            placeholder={t("Kërko...", "Search...")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <div className="max-h-48 overflow-y-auto">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                className="flex w-full flex-col rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
                onClick={() => {
                  onChange(item.id);
                  setLabel(item.label);
                  setOpen(false);
                }}
              >
                <span className="font-medium">{item.label}</span>
                {item.sublabel && <span className="text-xs text-muted-foreground">{item.sublabel}</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
