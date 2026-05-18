"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { BilingualString } from "@/lib/site-content/types";

export function BilingualInput({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: BilingualString;
  onChange: (v: BilingualString) => void;
  multiline?: boolean;
}) {
  return (
    <div className="space-y-3">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <LocaleField
        localeLabel="Shqip (sq)"
        value={value.sq}
        onChange={(sq) => onChange({ ...value, sq })}
        multiline={multiline}
      />
      <LocaleField
        localeLabel="English (en)"
        value={value.en}
        onChange={(en) => onChange({ ...value, en })}
        multiline={multiline}
      />
    </div>
  );
}


function LocaleField({
  localeLabel,
  value,
  onChange,
  multiline,
}: {
  localeLabel: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{localeLabel}</span>
      {multiline ? (
        <Textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} />
      ) : (
        <Input value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}
