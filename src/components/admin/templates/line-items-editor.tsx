"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Layers, Package, Plus, Trash2, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { LineItem } from "@/lib/templates/types";
import { formatMoney, lineItemTotal, sumLineItems } from "@/lib/templates/calculate";
import { LineItemNumericRow } from "./line-item-numeric-row";
import { v4 as uuid } from "uuid";
import { CatalogProductPicker } from "./catalog-product-picker";
import type { CatalogSearchItem } from "@/app/api/admin/templates/catalog-search/route";

function emptyItem(): LineItem {
  return { id: uuid(), name: "", description: "", quantity: 1, unitPrice: 0, vatPercent: 0 };
}

type TabKey = "services" | "products";

function FieldCell({
  id,
  label,
  children,
  className,
}: {
  id: string;
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id} className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

export function LineItemsEditor({
  services,
  products,
  onServicesChange,
  onProductsChange,
  labels,
  currency,
  locale,
  vatEnabled = true,
}: {
  services: LineItem[];
  products: LineItem[];
  onServicesChange: (items: LineItem[]) => void;
  onProductsChange: (items: LineItem[]) => void;
  vatEnabled?: boolean;
  labels: {
    services: string;
    products: string;
    title: string;
    hint: string;
    colName: string;
    colQty: string;
    colUnitPrice: string;
    colVat: string;
    colLineTotal: string;
    addLine: string;
    emptyLines: string;
    emptyLinesHint: string;
    tabSubtotal: string;
    descriptionOptional: string;
    pickFromCatalog: string;
    catalogSearch: string;
    catalogEmpty: string;
    catalogLoading: string;
    catalogError: string;
    vatSuffix: string;
    removeLine: string;
  };
  currency: string;
  locale: string;
}) {
  const [tab, setTab] = useState<TabKey>("services");
  const loc = locale === "en" ? "en" : "sq";

  const activeItems = tab === "services" ? services : products;
  const setActiveItems = tab === "services" ? onServicesChange : onProductsChange;

  const tabSubtotal = useMemo(() => sumLineItems(activeItems), [activeItems]);
  const tabTotal = useMemo(
    () => activeItems.reduce((s, i) => s + lineItemTotal(i), 0),
    [activeItems]
  );

  function updateItem(idx: number, patch: Partial<LineItem>) {
    const next = [...activeItems];
    next[idx] = { ...next[idx], ...patch };
    setActiveItems(next);
  }

  function removeItem(idx: number) {
    setActiveItems(activeItems.filter((_, i) => i !== idx));
  }

  function addFromCatalog(item: CatalogSearchItem) {
    setActiveItems([
      ...activeItems,
      {
        id: uuid(),
        name: item.name,
        description: item.unit ?? "",
        quantity: 1,
        unitPrice: item.price,
        vatPercent: item.vatRate,
      },
    ]);
  }

  const tabs: { key: TabKey; label: string; icon: typeof Wrench; count: number }[] = [
    { key: "services", label: labels.services, icon: Wrench, count: services.length },
    { key: "products", label: labels.products, icon: Package, count: products.length },
  ];

  return (
    <section className="overflow-hidden rounded-2xl border border-border/50 bg-[var(--admin-card-surface,hsl(var(--card)))] shadow-[var(--admin-shadow-sm)] ring-1 ring-black/[0.03] dark:ring-white/[0.05]">
      <header className="border-b border-border/50 bg-gradient-to-b from-muted/30 to-transparent px-4 py-4 sm:px-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Layers className="h-5 w-5" strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold tracking-tight">{labels.title}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">{labels.hint}</p>
          </div>
        </div>

        <div
          className="mt-4 flex gap-1 rounded-xl bg-muted/50 p-1"
          role="tablist"
          aria-label={labels.title}
        >
          {tabs.map(({ key, label, icon: Icon, count }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ease-out",
                tab === key
                  ? "bg-background text-foreground shadow-sm ring-1 ring-border/60"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
              <span className="truncate">{label}</span>
              <span
                className={cn(
                  "inline-flex min-w-[1.25rem] justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                  tab === key ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                )}
              >
                {count}
              </span>
            </button>
          ))}
        </div>
      </header>

      <div className="p-4 sm:p-5">
        {activeItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/15 px-6 py-10 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted/50 text-muted-foreground">
              {tab === "services" ? (
                <Wrench className="h-5 w-5" strokeWidth={2} />
              ) : (
                <Package className="h-5 w-5" strokeWidth={2} />
              )}
            </div>
            <p className="text-sm font-medium">{labels.emptyLines}</p>
            <p className="mt-1 max-w-xs text-xs text-muted-foreground">{labels.emptyLinesHint}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button
                type="button"
                size="sm"
                className="gap-1.5"
                onClick={() => setActiveItems([emptyItem()])}
              >
                <Plus className="h-4 w-4" />
                {labels.addLine}
              </Button>
              {tab === "products" && (
                <CatalogProductPicker
                  onSelect={addFromCatalog}
                  labels={{
                    trigger: labels.pickFromCatalog,
                    placeholder: labels.catalogSearch,
                    empty: labels.catalogEmpty,
                    loading: labels.catalogLoading,
                    error: labels.catalogError,
                    unit: labels.vatSuffix,
                  }}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {activeItems.map((item, idx) => {
              const baseId = `${tab}-${item.id}`;
              return (
                <article
                  key={item.id}
                  className="rounded-xl border border-border/60 bg-background shadow-sm"
                >
                  {/* Item header: number badge + name + delete */}
                  <div className="flex items-start gap-3 px-4 pt-4">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1 space-y-3">
                      <FieldCell id={`${baseId}-name`} label={labels.colName}>
                        <Input
                          id={`${baseId}-name`}
                          className="h-9 bg-muted/30 focus:bg-background"
                          value={item.name}
                          onChange={(e) => updateItem(idx, { name: e.target.value })}
                        />
                      </FieldCell>
                      <FieldCell id={`${baseId}-desc`} label={labels.descriptionOptional}>
                        <Input
                          id={`${baseId}-desc`}
                          className="h-9 bg-muted/30 focus:bg-background"
                          value={item.description ?? ""}
                          onChange={(e) => updateItem(idx, { description: e.target.value })}
                        />
                      </FieldCell>
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className="mt-0.5 h-8 w-8 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      aria-label={labels.removeLine}
                      onClick={() => removeItem(idx)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="px-4 pb-4">
                    <LineItemNumericRow
                      baseId={baseId}
                      item={item}
                      currency={currency}
                      locale={locale}
                      labels={labels}
                      showVatField
                      includeVatInTotal={vatEnabled}
                      onChange={(patch) => updateItem(idx, patch)}
                    />
                  </div>
                </article>
              );
            })}

            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2 border-dashed"
                onClick={() => setActiveItems([...activeItems, emptyItem()])}
              >
                <Plus className="h-4 w-4" />
                {labels.addLine}
              </Button>
              {tab === "products" && (
                <CatalogProductPicker
                  onSelect={addFromCatalog}
                  labels={{
                    trigger: labels.pickFromCatalog,
                    placeholder: labels.catalogSearch,
                    empty: labels.catalogEmpty,
                    loading: labels.catalogLoading,
                    error: labels.catalogError,
                    unit: labels.vatSuffix,
                  }}
                />
              )}
            </div>
          </div>
        )}
      </div>

      <footer className="border-t border-border/50 bg-muted/20 px-4 py-3 sm:px-5">
        <p className="text-xs text-muted-foreground">
          {labels.tabSubtotal}{" "}
          <span className="font-medium text-foreground tabular-nums">
            {formatMoney(tabSubtotal, currency, loc)}
          </span>
          {tabTotal !== tabSubtotal ? (
            <>
              {" · "}
              {labels.colLineTotal}{" "}
              <span className="font-semibold text-primary tabular-nums">
                {formatMoney(tabTotal, currency, loc)}
              </span>
            </>
          ) : null}
        </p>
      </footer>
    </section>
  );
}
