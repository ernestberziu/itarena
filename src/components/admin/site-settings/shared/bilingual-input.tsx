"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { BilingualString } from "@/lib/site-content/types";

export function BilingualInput({
  label,
  value,
  onChange,
  multiline,
  rows = 3,
  inputClassName,
}: {
  label: string;
  value: BilingualString;
  onChange: (v: BilingualString) => void;
  multiline?: boolean;
  rows?: number;
  inputClassName?: string;
}) {
  return (
    <div className="space-y-3">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <LocaleField
        localeLabel="Shqip (sq)"
        value={value.sq}
        onChange={(sq) => onChange({ ...value, sq })}
        multiline={multiline}
        rows={rows}
        inputClassName={inputClassName}
      />
      <LocaleField
        localeLabel="English (en)"
        value={value.en}
        onChange={(en) => onChange({ ...value, en })}
        multiline={multiline}
        rows={rows}
        inputClassName={inputClassName}
      />
    </div>
  );
}

function LocaleField({
  localeLabel,
  value,
  onChange,
  multiline,
  rows,
  inputClassName,
}: {
  localeLabel: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  rows?: number;
  inputClassName?: string;
}) {
  return (
    <div className="space-y-1.5">
      <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{localeLabel}</span>
      {multiline ? (
        <Textarea
          className={cn(inputClassName)}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
        />
      ) : (
        <Input className={cn(inputClassName)} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}
