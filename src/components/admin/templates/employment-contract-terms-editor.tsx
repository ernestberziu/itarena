"use client";

import type { ReactNode } from "react";
import {
  AlertCircle,
  Banknote,
  Briefcase,
  CalendarDays,
  ClipboardList,
  User,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { EmploymentLocalizedContent, EmploymentPayload } from "@/lib/templates/types";

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

export function EmploymentContractTermsEditor({
  payload,
  onChange,
  localizedContent,
  onLocalizedChange,
  labels,
}: {
  payload: EmploymentPayload;
  onChange: (patch: Partial<EmploymentPayload>) => void;
  localizedContent: EmploymentLocalizedContent;
  onLocalizedChange: (patch: Partial<EmploymentLocalizedContent>) => void;
  labels: {
    title: string;
    hint: string;
    sectionEmployee: string;
    firstName: string;
    lastName: string;
    idNumber: string;
    sectionEmployment: string;
    position: string;
    contractType: string;
    startDate: string;
    endDate: string;
    endDateHint: string;
    workingHours: string;
    sectionCompensation: string;
    salary: string;
    sectionEmployeeDuties: string;
    employeeDuties: string;
    employeeDutiesHint: string;
    sectionEmployerDuties: string;
    employerDuties: string;
    employerDutiesHint: string;
    sectionVacations: string;
    annualLeave: string;
    annualLeaveHint: string;
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
            <Briefcase className="h-5 w-5" strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold tracking-tight">{labels.title}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">{labels.hint}</p>
          </div>
        </div>
      </header>

      {/* Employee */}
      <SectionBlock title={labels.sectionEmployee} icon={User}>
        <div className="grid gap-3 sm:grid-cols-3">
          <FieldCell id="emp-firstname" label={labels.firstName}>
            <Input
              id="emp-firstname"
              className="h-9 bg-background"
              value={payload.firstName}
              onChange={(e) => onChange({ firstName: e.target.value })}
            />
          </FieldCell>
          <FieldCell id="emp-lastname" label={labels.lastName}>
            <Input
              id="emp-lastname"
              className="h-9 bg-background"
              value={payload.lastName}
              onChange={(e) => onChange({ lastName: e.target.value })}
            />
          </FieldCell>
          <FieldCell id="emp-idnumber" label={labels.idNumber}>
            <Input
              id="emp-idnumber"
              className="h-9 bg-background"
              value={payload.idNumber}
              onChange={(e) => onChange({ idNumber: e.target.value })}
            />
          </FieldCell>
        </div>
      </SectionBlock>

      {/* Employment */}
      <SectionBlock title={labels.sectionEmployment} icon={Briefcase}>
        <div className="grid gap-3 sm:grid-cols-2">
          <FieldCell id="emp-position" label={labels.position} className="sm:col-span-2">
            <Input
              id="emp-position"
              className="h-9 bg-background"
              value={payload.position}
              onChange={(e) => onChange({ position: e.target.value })}
            />
          </FieldCell>
          <FieldCell id="emp-contract-type" label={labels.contractType}>
            <Input
              id="emp-contract-type"
              className="h-9 bg-background"
              value={localizedContent.contractType}
              onChange={(e) => onLocalizedChange({ contractType: e.target.value })}
            />
          </FieldCell>
          <FieldCell id="emp-hours" label={labels.workingHours}>
            <Input
              id="emp-hours"
              className="h-9 bg-background"
              value={localizedContent.workingHours}
              onChange={(e) => onLocalizedChange({ workingHours: e.target.value })}
            />
          </FieldCell>
          <FieldCell id="emp-start" label={labels.startDate}>
            <Input
              id="emp-start"
              type="date"
              className="h-9 bg-background"
              value={payload.startDate}
              onChange={(e) => onChange({ startDate: e.target.value })}
            />
          </FieldCell>
          <FieldCell id="emp-end" label={labels.endDate} hint={labels.endDateHint}>
            <Input
              id="emp-end"
              type="date"
              className="h-9 bg-background"
              value={payload.endDate ?? ""}
              onChange={(e) => onChange({ endDate: e.target.value || undefined })}
            />
          </FieldCell>
        </div>
      </SectionBlock>

      {/* Compensation */}
      <SectionBlock title={labels.sectionCompensation} icon={Banknote}>
        <FieldCell id="emp-salary" label={labels.salary}>
          <Input
            id="emp-salary"
            className="h-9 bg-background"
            value={payload.salary}
            onChange={(e) => onChange({ salary: e.target.value })}
          />
        </FieldCell>
      </SectionBlock>

      {/* Employee duties */}
      <SectionBlock title={labels.sectionEmployeeDuties} icon={User}>
        <FieldCell id="emp-employee-duties" label={labels.employeeDuties} hint={labels.employeeDutiesHint}>
          <Textarea
            id="emp-employee-duties"
            className="min-h-[140px] bg-background font-mono text-xs"
            value={localizedContent.employeeDuties}
            onChange={(e) => onLocalizedChange({ employeeDuties: e.target.value })}
          />
        </FieldCell>
      </SectionBlock>

      {/* Employer duties */}
      <SectionBlock title={labels.sectionEmployerDuties} icon={ClipboardList}>
        <FieldCell id="emp-duties" label={labels.employerDuties} hint={labels.employerDutiesHint}>
          <Textarea
            id="emp-duties"
            className="min-h-[140px] bg-background font-mono text-xs"
            value={localizedContent.employerDuties}
            onChange={(e) => onLocalizedChange({ employerDuties: e.target.value })}
          />
        </FieldCell>
      </SectionBlock>

      {/* Vacations & Leave */}
      <SectionBlock title={labels.sectionVacations} icon={CalendarDays}>
        <FieldCell id="emp-annual-leave" label={labels.annualLeave} hint={labels.annualLeaveHint}>
          <Textarea
            id="emp-annual-leave"
            className="min-h-[120px] bg-background font-mono text-xs"
            value={localizedContent.annualLeave}
            onChange={(e) => onLocalizedChange({ annualLeave: e.target.value })}
          />
        </FieldCell>
      </SectionBlock>

      {/* Termination */}
      <SectionBlock title={labels.sectionTermination} icon={AlertCircle}>
        <FieldCell id="emp-notice" label={labels.noticePeriod} hint={labels.noticePeriodHint}>
          <Input
            id="emp-notice"
            className="h-9 bg-background"
            value={localizedContent.noticePeriod ?? ""}
            onChange={(e) => onLocalizedChange({ noticePeriod: e.target.value })}
          />
        </FieldCell>
      </SectionBlock>
    </section>
  );
}
