"use client";

import type { ReactNode } from "react";
import {
  AlertCircle,
  Banknote,
  Handshake,
  MapPin,
  ClipboardList,
  User,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { PartnerLocalizedContent, PartnerPayload } from "@/lib/templates/types";

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
  icon: typeof User;
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

export function PartnerContractTermsEditor({
  payload,
  onChange,
  localizedContent,
  onLocalizedChange,
  labels,
}: {
  payload: PartnerPayload;
  onChange: (patch: Partial<PartnerPayload>) => void;
  localizedContent: PartnerLocalizedContent;
  onLocalizedChange: (patch: Partial<PartnerLocalizedContent>) => void;
  labels: {
    title: string;
    hint: string;
    sectionPartner: string;
    firstName: string;
    lastName: string;
    idNumber: string;
    sectionPartnership: string;
    role: string;
    contractType: string;
    territory: string;
    contractDate: string;
    startDate: string;
    endDate: string;
    endDateHint: string;
    sectionCommercial: string;
    commission: string;
    commissionTerms: string;
    commissionTermsHint: string;
    sectionPartnerObligations: string;
    partnerObligations: string;
    partnerObligationsHint: string;
    sectionItarenaObligations: string;
    itarenaObligations: string;
    itarenaObligationsHint: string;
    sectionBrand: string;
    brandUsage: string;
    brandUsageHint: string;
    sectionTermination: string;
    noticePeriod: string;
    noticePeriodHint: string;
  };
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border/50 bg-[var(--admin-card-surface,hsl(var(--card)))] shadow-[var(--admin-shadow-sm)] ring-1 ring-black/[0.03] dark:ring-white/[0.05]">
      <header className="border-b border-border/50 bg-gradient-to-b from-muted/30 to-transparent px-4 py-4 sm:px-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Handshake className="h-5 w-5" strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold tracking-tight">{labels.title}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">{labels.hint}</p>
          </div>
        </div>
      </header>

      <SectionBlock title={labels.sectionPartner} icon={User}>
        <div className="grid gap-3 sm:grid-cols-3">
          <FieldCell id="partner-firstname" label={labels.firstName}>
            <Input
              id="partner-firstname"
              className="h-9 bg-background"
              value={payload.firstName}
              onChange={(e) => onChange({ firstName: e.target.value })}
            />
          </FieldCell>
          <FieldCell id="partner-lastname" label={labels.lastName}>
            <Input
              id="partner-lastname"
              className="h-9 bg-background"
              value={payload.lastName}
              onChange={(e) => onChange({ lastName: e.target.value })}
            />
          </FieldCell>
          <FieldCell id="partner-idnumber" label={labels.idNumber}>
            <Input
              id="partner-idnumber"
              className="h-9 bg-background"
              value={payload.idNumber}
              onChange={(e) => onChange({ idNumber: e.target.value })}
            />
          </FieldCell>
        </div>
      </SectionBlock>

      <SectionBlock title={labels.sectionPartnership} icon={Handshake}>
        <div className="grid gap-3 sm:grid-cols-2">
          <FieldCell id="partner-role" label={labels.role} className="sm:col-span-2">
            <Input
              id="partner-role"
              className="h-9 bg-background"
              value={payload.role}
              onChange={(e) => onChange({ role: e.target.value })}
            />
          </FieldCell>
          <FieldCell id="partner-contract-type" label={labels.contractType}>
            <Input
              id="partner-contract-type"
              className="h-9 bg-background"
              value={localizedContent.contractType}
              onChange={(e) => onLocalizedChange({ contractType: e.target.value })}
            />
          </FieldCell>
          <FieldCell id="partner-territory" label={labels.territory}>
            <Input
              id="partner-territory"
              className="h-9 bg-background"
              value={localizedContent.territory}
              onChange={(e) => onLocalizedChange({ territory: e.target.value })}
            />
          </FieldCell>
          <FieldCell id="partner-contract-date" label={labels.contractDate}>
            <Input
              id="partner-contract-date"
              type="date"
              className="h-9 bg-background"
              value={payload.contractDate}
              onChange={(e) => onChange({ contractDate: e.target.value })}
            />
          </FieldCell>
          <FieldCell id="partner-start" label={labels.startDate}>
            <Input
              id="partner-start"
              type="date"
              className="h-9 bg-background"
              value={payload.startDate}
              onChange={(e) => onChange({ startDate: e.target.value })}
            />
          </FieldCell>
          <FieldCell id="partner-end" label={labels.endDate} hint={labels.endDateHint} className="sm:col-span-2">
            <Input
              id="partner-end"
              type="date"
              className="h-9 bg-background"
              value={payload.endDate ?? ""}
              onChange={(e) => onChange({ endDate: e.target.value || undefined })}
            />
          </FieldCell>
        </div>
      </SectionBlock>

      <SectionBlock title={labels.sectionCommercial} icon={Banknote}>
        <div className="space-y-3">
          <FieldCell id="partner-commission" label={labels.commission}>
            <Input
              id="partner-commission"
              className="h-9 bg-background"
              value={payload.commission}
              onChange={(e) => onChange({ commission: e.target.value })}
            />
          </FieldCell>
          <FieldCell id="partner-commission-terms" label={labels.commissionTerms} hint={labels.commissionTermsHint}>
            <Textarea
              id="partner-commission-terms"
              className="min-h-[120px] bg-background font-mono text-xs"
              value={localizedContent.commissionTerms}
              onChange={(e) => onLocalizedChange({ commissionTerms: e.target.value })}
            />
          </FieldCell>
        </div>
      </SectionBlock>

      <SectionBlock title={labels.sectionPartnerObligations} icon={User}>
        <FieldCell id="partner-obligations" label={labels.partnerObligations} hint={labels.partnerObligationsHint}>
          <Textarea
            id="partner-obligations"
            className="min-h-[140px] bg-background font-mono text-xs"
            value={localizedContent.partnerObligations}
            onChange={(e) => onLocalizedChange({ partnerObligations: e.target.value })}
          />
        </FieldCell>
      </SectionBlock>

      <SectionBlock title={labels.sectionItarenaObligations} icon={ClipboardList}>
        <FieldCell id="partner-itarena-obligations" label={labels.itarenaObligations} hint={labels.itarenaObligationsHint}>
          <Textarea
            id="partner-itarena-obligations"
            className="min-h-[140px] bg-background font-mono text-xs"
            value={localizedContent.itarenaObligations}
            onChange={(e) => onLocalizedChange({ itarenaObligations: e.target.value })}
          />
        </FieldCell>
      </SectionBlock>

      <SectionBlock title={labels.sectionBrand} icon={MapPin}>
        <FieldCell id="partner-brand" label={labels.brandUsage} hint={labels.brandUsageHint}>
          <Textarea
            id="partner-brand"
            className="min-h-[120px] bg-background font-mono text-xs"
            value={localizedContent.brandUsage}
            onChange={(e) => onLocalizedChange({ brandUsage: e.target.value })}
          />
        </FieldCell>
      </SectionBlock>

      <SectionBlock title={labels.sectionTermination} icon={AlertCircle}>
        <FieldCell id="partner-notice" label={labels.noticePeriod} hint={labels.noticePeriodHint}>
          <Input
            id="partner-notice"
            className="h-9 bg-background"
            value={localizedContent.noticePeriod ?? ""}
            onChange={(e) => onLocalizedChange({ noticePeriod: e.target.value })}
          />
        </FieldCell>
      </SectionBlock>
    </section>
  );
}
