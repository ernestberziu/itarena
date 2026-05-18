"use client";

import type { ReactNode } from "react";
import { Plus, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { LineItem, RecurringFrequency } from "@/lib/templates/types";
import {
  RECURRING_FREQUENCIES,
  recurringFrequencyLabel,
} from "@/lib/templates/recurring";
import { LineItemNumericRow } from "./line-item-numeric-row";
import { v4 as uuid } from "uuid";

function emptyItem(defaultFreq: RecurringFrequency = "MONTHLY"): LineItem {
  return {
    id: uuid(),
    name: "",
    description: "",
    quantity: 1,
    unitPrice: 0,
    vatPercent: 0,
    frequency: defaultFreq,
  };
}

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


export function RecurringLineItemsEditor({
  items,
  onChange,
  currency,
  locale,
  defaultFrequency,
  showVat = false,
  labels,
}: {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
  currency: string;
  locale: string;
  defaultFrequency?: RecurringFrequency;
  showVat?: boolean;
  labels: {
    title: string;
    hint: string;
    colName: string;
    colQty: string;
    colUnitPrice: string;
    colVat: string;
    colLineTotal: string;
    descriptionOptional: string;
    addLine: string;
    emptyLines: string;
    emptyLinesHint: string;
    frequency: string;
    removeItem: string;
  };
}) {
  const loc = locale === "en" ? "en" : "sq";
  const lang: "en" | "sq" = locale === "en" ? "en" : "sq";
  const defaultFreq: RecurringFrequency = defaultFrequency ?? "MONTHLY";

  function updateItem(idx: number, patch: Partial<LineItem>) {
    const next = [...items];
    next[idx] = { ...next[idx], ...patch };
    onChange(next);
  }

  function removeItem(idx: number) {
    onChange(items.filter((_, i) => i !== idx));
  }

  return (
    <div className="rounded-xl border border-border/50 bg-background/80">
      <div className="flex items-start gap-2 border-b border-border/50 px-4 py-3">
        <RefreshCw className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={2} aria-hidden />
        <div>
          <p className="text-sm font-medium">{labels.title}</p>
          <p className="text-xs text-muted-foreground">{labels.hint}</p>
        </div>
      </div>

      <div className="space-y-3 p-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center rounded-lg border border-dashed border-border/70 bg-muted/10 px-4 py-8 text-center">
            <p className="text-sm font-medium">{labels.emptyLines}</p>
            <p className="mt-1 max-w-xs text-xs text-muted-foreground">{labels.emptyLinesHint}</p>
            <Button
              type="button"
              size="sm"
              className="mt-3 gap-1.5"
              onClick={() => onChange([emptyItem(defaultFreq)])}
            >
              <Plus className="h-4 w-4" />
              {labels.addLine}
            </Button>
          </div>
        ) : (
          <>
            {items.map((item, idx) => {
              const baseId = `recurring-${item.id}`;
              const itemFreq: RecurringFrequency = item.frequency ?? defaultFreq;

              return (
                <article
                  key={item.id}
                  className="rounded-xl border border-border/50 bg-background shadow-sm"
                >
                  {/* Header row: number + name/desc + delete */}
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

                      {/* Per-item frequency */}
                      <div>
                        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {labels.frequency}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {RECURRING_FREQUENCIES.map((freq) => (
                            <button
                              key={freq}
                              type="button"
                              onClick={() => updateItem(idx, { frequency: freq })}
                              className={cn(
                                "rounded-md border px-2.5 py-1 text-[11px] font-medium transition-all",
                                itemFreq === freq
                                  ? "border-primary bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/20"
                                  : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
                              )}
                            >
                              {recurringFrequencyLabel(freq, lang)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className="mt-0.5 h-8 w-8 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      aria-label={labels.removeItem}
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
                      showVatField={showVat}
                      includeVatInTotal={showVat}
                      totalSuffix={`/${recurringFrequencyLabel(itemFreq, lang).toLowerCase()}`}
                      onChange={(patch) => updateItem(idx, patch)}
                    />
                  </div>
                </article>
              );
            })}

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full gap-2 border-dashed sm:w-auto"
              onClick={() => onChange([...items, emptyItem(defaultFreq)])}
            >
              <Plus className="h-4 w-4" />
              {labels.addLine}
            </Button>
          </>
        )}
      </div>

    </div>
  );
}
