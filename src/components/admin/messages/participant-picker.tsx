"use client";

import { useCallback, useState } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AsyncEntityPicker } from "@/components/admin/projects/async-entity-picker";
import type { ProjectLookupItem } from "@/lib/projects/lookup-types";

export type SelectedParticipant = ProjectLookupItem & { meta?: string };

export function ParticipantPicker({
  selected,
  onChange,
  labels,
  disabled,
  excludeIds,
  maxSelect,
}: {
  selected: SelectedParticipant[];
  onChange: (items: SelectedParticipant[]) => void;
  excludeIds?: string[];
  /** When 1, only one user can be selected (direct conversations). */
  maxSelect?: number;
  labels: {
    placeholder: string;
    empty: string;
    loading: string;
    error: string;
    minChars: string;
    staff: string;
    client: string;
  };
  disabled?: boolean;
}) {
  const [pickerKey, setPickerKey] = useState(0);

  const atMax = maxSelect !== undefined && selected.length >= maxSelect;
  const singleSelect = maxSelect === 1;

  const onSelect = useCallback(
    (item: ProjectLookupItem) => {
      if (excludeIds?.includes(item.id)) return;
      if (singleSelect) {
        onChange([item as SelectedParticipant]);
        setPickerKey((k) => k + 1);
        return;
      }
      if (selected.some((s) => s.id === item.id)) return;
      if (maxSelect !== undefined && selected.length >= maxSelect) return;
      onChange([...selected, item as SelectedParticipant]);
      setPickerKey((k) => k + 1);
    },
    [selected, onChange, excludeIds, maxSelect, singleSelect]
  );

  function remove(id: string) {
    onChange(selected.filter((s) => s.id !== id));
  }

  return (
    <div className="space-y-2">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((p) => (
            <Badge key={p.id} variant="secondary" className="gap-1 pr-1 text-xs font-normal">
              {p.label}
              <span className="text-muted-foreground">
                · {p.meta === "staff" ? labels.staff : labels.client}
              </span>
              <button
                type="button"
                onClick={() => remove(p.id)}
                className="ml-0.5 rounded-full p-0.5 hover:bg-muted"
                aria-label="Remove"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      {!atMax || singleSelect ? (
        <AsyncEntityPicker
          key={pickerKey}
          fetchUrl="/api/admin/conversations/lookup/users"
          labels={labels}
          onSelect={onSelect}
          disabled={disabled}
          clearOnSelect
          className="w-full"
        />
      ) : null}
    </div>
  );
}
