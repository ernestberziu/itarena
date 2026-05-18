"use client";

import type { ReactNode } from "react";
import {
  AlertCircle,
  CalendarRange,
  FileText,
  Percent,
  Receipt,
  RefreshCw,
  StickyNote,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { LineItem, ServiceContractPayload, ServiceLocalizedContent } from "@/lib/templates/types";
import { formatMoney } from "@/lib/templates/calculate";
import { TemplateOptionToggle } from "./template-option-toggle";
import { RecurringLineItemsEditor } from "./recurring-line-items-editor";
import { v4 as uuid } from "uuid";

const CURRENCIES = ["ALL", "EUR", "USD"] as const;

function emptyRecurringItem(): LineItem {
  return { id: uuid(), name: "", description: "", quantity: 1, unitPrice: 0, vatPercent: 0 };
}

function FieldCell({
  id,
  label,
  hint,
  children,
  className,
}: {
  id: string;
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id} className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      {children}
      {hint ? <p className="text-[11px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function SectionBlock({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof CalendarRange;
  children: ReactNode;
}) {
  return (
    <div className="border-b border-border/50 px-4 py-4 last:border-b-0 sm:px-5">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" strokeWidth={2} aria-hidden />
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h4>
      </div>
      {children}
    </div>
  );
}

export function ServiceContractTermsEditor({
  payload,
  onChange,
  localizedContent,
  onLocalizedChange,
  language,
  contractTotal,
  labels,
}: {
  payload: ServiceContractPayload;
  onChange: (patch: Partial<ServiceContractPayload>) => void;
  localizedContent: ServiceLocalizedContent;
  onLocalizedChange: (patch: Partial<ServiceLocalizedContent>) => void;
  language: "sq" | "en";
  contractTotal: number;
  labels: {
    title: string;
    hint: string;
    sectionDates: string;
    contractDate: string;
    startDate: string;
    endDate: string;
    endDateHint: string;
    sectionCommercial: string;
    currency: string;
    paymentTerms: string;
    deliveryTerms: string;
    sectionTax: string;
    vatEnabled: string;
    vatHint: string;
    sectionRecurring: string;
    recurringHint: string;
    recurringEnabled: string;
    recurringStart: string;
    recurringServicesTitle: string;
    recurringServicesHint: string;
    colName: string;
    colQty: string;
    colUnitPrice: string;
    colVat: string;
    colLineTotal: string;
    descriptionOptional: string;
    addLine: string;
    emptyLines: string;
    emptyLinesHint: string;
    recurringItemFrequency: string;
    recurringVatEnabled: string;
    recurringVatHint: string;
    sectionTermination: string;
    sectionTerminationOnetime: string;
    noticePeriod: string;
    noticePeriodHint: string;
    noticePeriodHintOnetime: string;
    sectionNotes: string;
    notes: string;
    showPrices: string;
    showPricesHint: string;
    removeItem: string;
  };
}) {
  const loc = language === "en" ? "en" : "sq";
  const recurringOn = payload.recurringEnabled ?? false;
  const recurringServices = payload.recurringServices ?? [];
  return (
    <section className="overflow-hidden rounded-2xl border border-border/50 bg-[var(--admin-card-surface,hsl(var(--card)))] shadow-[var(--admin-shadow-sm)] ring-1 ring-black/[0.03] dark:ring-white/[0.05]">
      <header className="border-b border-border/50 bg-gradient-to-b from-muted/30 to-transparent px-4 py-4 sm:px-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileText className="h-5 w-5" strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold tracking-tight">{labels.title}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">{labels.hint}</p>
          </div>
        </div>
      </header>

      <SectionBlock title={labels.sectionDates} icon={CalendarRange}>
        <div className="grid gap-3 sm:grid-cols-3">
          <FieldCell id="contract-date" label={labels.contractDate}>
            <Input
              id="contract-date"
              type="date"
              className="h-9 bg-background"
              value={payload.contractDate}
              onChange={(e) => onChange({ contractDate: e.target.value })}
            />
          </FieldCell>
          <FieldCell id="start-date" label={labels.startDate}>
            <Input
              id="start-date"
              type="date"
              className="h-9 bg-background"
              value={payload.startDate}
              onChange={(e) => onChange({ startDate: e.target.value })}
            />
          </FieldCell>
          <FieldCell id="end-date" label={labels.endDate} hint={labels.endDateHint}>
            <Input
              id="end-date"
              type="date"
              className="h-9 bg-background"
              value={payload.endDate ?? ""}
              onChange={(e) => onChange({ endDate: e.target.value || undefined })}
            />
          </FieldCell>
        </div>
      </SectionBlock>

      <SectionBlock title={labels.sectionCommercial} icon={Receipt}>
        <div className="grid gap-3">
          <FieldCell id="currency" label={labels.currency} className="max-w-[140px]">
            <Select
              value={payload.currency}
              onValueChange={(v) => v != null && onChange({ currency: v })}
            >
              <SelectTrigger id="currency" className="h-9 w-full bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldCell>
          <FieldCell id="payment-terms" label={labels.paymentTerms}>
            <Input
              id="payment-terms"
              className="h-9 bg-background"
              value={localizedContent.paymentTerms}
              onChange={(e) => onLocalizedChange({ paymentTerms: e.target.value })}
            />
          </FieldCell>
          <FieldCell id="delivery-terms" label={labels.deliveryTerms}>
            <Input
              id="delivery-terms"
              className="h-9 bg-background"
              value={localizedContent.deliveryTerms}
              onChange={(e) => onLocalizedChange({ deliveryTerms: e.target.value })}
            />
          </FieldCell>
          <TemplateOptionToggle
            id="show-prices"
            checked={payload.showPrices !== false}
            onCheckedChange={(v) => onChange({ showPrices: v })}
            title={labels.showPrices}
            description={labels.showPricesHint}
            icon={Receipt}
          />
        </div>
      </SectionBlock>

      <SectionBlock title={labels.sectionTax} icon={Percent}>
        <TemplateOptionToggle
          id="vat-enabled"
          checked={payload.vatEnabled}
          onCheckedChange={(v) => onChange({ vatEnabled: v })}
          title={labels.vatEnabled}
          description={labels.vatHint}
          icon={Percent}
        />
      </SectionBlock>

      <SectionBlock title={labels.sectionRecurring} icon={RefreshCw}>
        <div className="space-y-4">
          <TemplateOptionToggle
            id="recurring-enabled"
            checked={recurringOn}
            onCheckedChange={(v) => {
              const patch: Partial<ServiceContractPayload> = {
                recurringEnabled: v,
                recurringStartDate: v
                  ? payload.recurringStartDate ?? payload.startDate
                  : payload.recurringStartDate,
              };
              if (v && recurringServices.length === 0) {
                patch.recurringServices = [emptyRecurringItem()];
              }
              onChange(patch);
            }}
            title={labels.recurringEnabled}
            description={labels.recurringHint}
            icon={RefreshCw}
          >

            <TemplateOptionToggle
              id="recurring-vat-enabled"
              checked={payload.recurringVatEnabled ?? false}
              onCheckedChange={(v) => onChange({ recurringVatEnabled: v })}
              title={labels.recurringVatEnabled}
              description={labels.recurringVatHint}
              icon={Percent}
            />

            <RecurringLineItemsEditor
              items={recurringServices}
              onChange={(items) => onChange({ recurringServices: items })}
              currency={payload.currency}
              locale={language}
              defaultFrequency="MONTHLY"
              showVat={payload.recurringVatEnabled ?? false}
              labels={{
                title: labels.recurringServicesTitle,
                hint: labels.recurringServicesHint,
                colName: labels.colName,
                colQty: labels.colQty,
                colUnitPrice: labels.colUnitPrice,
                colVat: labels.colVat,
                colLineTotal: labels.colLineTotal,
                descriptionOptional: labels.descriptionOptional,
                addLine: labels.addLine,
                emptyLines: labels.emptyLines,
                emptyLinesHint: labels.emptyLinesHint,
                frequency: labels.recurringItemFrequency,
                removeItem: labels.removeItem,
              }}
            />

            <FieldCell id="recurring-start" label={labels.recurringStart}>
              <Input
                id="recurring-start"
                type="date"
                className="h-9 max-w-xs bg-background"
                value={payload.recurringStartDate ?? payload.startDate}
                onChange={(e) => onChange({ recurringStartDate: e.target.value })}
              />
            </FieldCell>

          </TemplateOptionToggle>
        </div>
      </SectionBlock>

      <SectionBlock
        title={recurringOn ? labels.sectionTermination : labels.sectionTerminationOnetime}
        icon={AlertCircle}
      >
        <FieldCell
          id="notice-period"
          label={labels.noticePeriod}
          hint={recurringOn ? labels.noticePeriodHint : labels.noticePeriodHintOnetime}
        >
          <Input
            id="notice-period"
            className="h-9 bg-background"
            value={localizedContent.noticePeriod ?? ""}
            onChange={(e) => onLocalizedChange({ noticePeriod: e.target.value })}
          />
        </FieldCell>
      </SectionBlock>

      <SectionBlock title={labels.sectionNotes} icon={StickyNote}>
        <FieldCell id="notes" label={labels.notes}>
          <Textarea
            id="notes"
            className="min-h-[88px] bg-background"
            value={localizedContent.notes ?? ""}
            onChange={(e) => onLocalizedChange({ notes: e.target.value })}
          />
        </FieldCell>
      </SectionBlock>
    </section>
  );
}
