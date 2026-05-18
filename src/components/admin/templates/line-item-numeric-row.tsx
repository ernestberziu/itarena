"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { LineItem } from "@/lib/templates/types";
import { formatMoney, lineItemTotal } from "@/lib/templates/calculate";

type Labels = {
  colQty: string;
  colUnitPrice: string;
  colVat: string;
  colLineTotal: string;
};

type Props = {
  baseId: string;
  item: LineItem;
  currency: string;
  locale: string;
  labels: Labels;
  onChange: (patch: Partial<LineItem>) => void;
  /** Show the VAT % input column */
  showVatField?: boolean;
  /** Include per-line VAT in the line total amount */
  includeVatInTotal?: boolean;
  /** Optional suffix after the total (e.g. "/monthly") */
  totalSuffix?: string;
};

export function LineItemNumericRow({
  baseId,
  item,
  currency,
  locale,
  labels,
  onChange,
  showVatField = true,
  includeVatInTotal = true,
  totalSuffix,
}: Props) {
  const loc = locale === "en" ? "en" : "sq";
  const total = includeVatInTotal
    ? lineItemTotal(item)
    : item.quantity * item.unitPrice;

  return (
    <div className="mt-4 space-y-4 border-t border-border/40 pt-4">
      {/* Qty × unit price (+ VAT) */}
      <div
        className={cn(
          "grid w-full max-w-md items-end gap-x-2",
          showVatField
            ? "grid-cols-[4.5rem_1.25rem_minmax(6rem,1fr)_1.25rem_4.5rem]"
            : "grid-cols-[4.5rem_1.25rem_minmax(6rem,1fr)]"
        )}
      >
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {labels.colQty}
          </span>
          <Input
            id={`${baseId}-qty`}
            type="number"
            min={0}
            inputMode="decimal"
            className="h-9 w-full bg-background text-center tabular-nums"
            value={item.quantity}
            onChange={(e) => onChange({ quantity: Number(e.target.value) || 0 })}
          />
        </div>

        <span className="flex h-9 items-center justify-center text-sm text-muted-foreground">
          ×
        </span>

        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {labels.colUnitPrice}
          </span>
          <div className="relative w-full">
            <span className="pointer-events-none absolute left-2.5 top-1/2 z-10 -translate-y-1/2 text-xs text-muted-foreground">
              {currency}
            </span>
            <Input
              id={`${baseId}-price`}
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              className="h-9 w-full bg-background pl-10 pr-2 text-right tabular-nums"
              value={item.unitPrice}
              onChange={(e) => onChange({ unitPrice: Number(e.target.value) || 0 })}
            />
          </div>
        </div>

        {showVatField ? (
          <>
            <span className="flex h-9 items-center justify-center text-sm text-muted-foreground">
              +
            </span>
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {labels.colVat}
              </span>
              <div className="relative w-full">
                <Input
                  id={`${baseId}-vat`}
                  type="number"
                  min={0}
                  max={100}
                  inputMode="decimal"
                  className="h-9 w-full bg-background pr-6 text-right tabular-nums"
                  value={item.vatPercent}
                  onChange={(e) => onChange({ vatPercent: Number(e.target.value) || 0 })}
                />
                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  %
                </span>
              </div>
            </div>
          </>
        ) : null}
      </div>

      {/* Line total — own row */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
          {labels.colLineTotal}
        </span>
        <div
          id={`${baseId}-total`}
          className="flex h-10 w-full items-center justify-end gap-1.5 rounded-lg border border-primary/25 bg-primary/6 px-3 text-sm font-bold tabular-nums text-primary"
        >
          <span>{formatMoney(total, currency, loc)}</span>
          {totalSuffix ? (
            <span className="text-[11px] font-normal opacity-70">{totalSuffix}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
