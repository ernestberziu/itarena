"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { buildAdminTicketsListHref } from "@/lib/admin-tickets-list-href";

export type AssigneeFilterOption = { id: string; firstName: string; lastName: string };

export function AdminTicketsAssigneeSelect({
  listPrefix,
  engineers,
  assignee,
  requester,
  projectId,
  q,
  status,
  priority,
  breached,
  labels,
}: {
  listPrefix: string;
  engineers: AssigneeFilterOption[];
  assignee?: string | null;
  requester?: string | null;
  projectId?: string | null;
  q?: string | null;
  status?: string | null;
  priority?: string | null;
  breached?: boolean;
  labels: {
    placeholder: string;
    all: string;
    unassigned: string;
  };
}) {
  const router = useRouter();
  const raw = assignee?.trim();
  const selectValue =
    raw === "unassigned" ? "__unassigned__" : raw && /^c[a-z0-9]{24}$/i.test(raw) ? raw : "__all__";

  const triggerLabel =
    selectValue === "__all__"
      ? labels.all
      : selectValue === "__unassigned__"
        ? labels.unassigned
        : (() => {
            const e = engineers.find((x) => x.id === selectValue);
            return e ? `${e.firstName} ${e.lastName}`.trim() : labels.placeholder;
          })();

  function navigate(next: string) {
    const assigneeParam =
      next === "__all__" ? null : next === "__unassigned__" ? "unassigned" : next;
    const href = buildAdminTicketsListHref(listPrefix, {
      q,
      status,
      priority,
      breached,
      assignee: assigneeParam,
      requester,
      projectId,
    });
    router.push(href);
  }

  return (
    <Select value={selectValue} onValueChange={(v) => v && navigate(v)}>
      <SelectTrigger
        size="sm"
        className="h-9 w-full min-w-0 border-border/70 bg-background/80 shadow-sm hover:bg-background dark:bg-input/25"
        aria-label={labels.placeholder}
      >
        <SelectValue placeholder={labels.placeholder}>{triggerLabel}</SelectValue>
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false} className="min-w-[var(--anchor-width)] max-h-72">
        <SelectItem value="__all__">{labels.all}</SelectItem>
        <SelectItem value="__unassigned__">{labels.unassigned}</SelectItem>
        {engineers.map((e) => (
          <SelectItem key={e.id} value={e.id}>
            {e.firstName} {e.lastName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
