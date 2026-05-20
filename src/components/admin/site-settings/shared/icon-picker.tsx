"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LUCIDE_ICON_OPTIONS, getLucideIcon } from "@/lib/site-content/icons";
import { adminWhiteInputClassName } from "@/components/admin/admin-white-dialog";
import { cn } from "@/lib/utils";

export function IconPicker({
  label,
  value,
  onChange,
  triggerClassName,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  triggerClassName?: string;
}) {
  const Icon = getLucideIcon(value);

  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={(v) => v && onChange(v)}>
        <SelectTrigger className={cn(adminWhiteInputClassName, triggerClassName)}>
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border/60 bg-muted/30">
              <Icon className="h-4 w-4" strokeWidth={2} />
            </span>
            <SelectValue placeholder="Select icon" />
          </div>
        </SelectTrigger>
        <SelectContent className="max-h-60 bg-white dark:bg-white">
          {LUCIDE_ICON_OPTIONS.map((key) => {
            const ItemIcon = getLucideIcon(key);
            return (
              <SelectItem key={key} value={key}>
                <span className="flex items-center gap-2">
                  <ItemIcon className="h-4 w-4 shrink-0" strokeWidth={2} />
                  {key}
                </span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
