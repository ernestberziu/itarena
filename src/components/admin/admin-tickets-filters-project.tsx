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

export type ProjectFilterOption = { id: string; title: string };

export function AdminTicketsProjectSelect({
  listPrefix,
  projects,
  projectId,
  assignee,
  requester,
  q,
  status,
  priority,
  breached,
  labels,
}: {
  listPrefix: string;
  projects: ProjectFilterOption[];
  projectId?: string | null;
  assignee?: string | null;
  requester?: string | null;
  q?: string | null;
  status?: string | null;
  priority?: string | null;
  breached?: boolean;
  labels: {
    placeholder: string;
    all: string;
    none: string;
  };
}) {
  const router = useRouter();
  const raw = projectId?.trim();
  const selectValue =
    raw === "none" ? "__none__" : raw && /^c[a-z0-9]{24}$/i.test(raw) ? raw : "__all__";

  const triggerLabel =
    selectValue === "__all__"
      ? labels.all
      : selectValue === "__none__"
        ? labels.none
        : projects.find((p) => p.id === selectValue)?.title ?? labels.placeholder;

  function navigate(next: string) {
    const projectParam =
      next === "__all__" ? null : next === "__none__" ? "none" : next;
    router.push(
      buildAdminTicketsListHref(listPrefix, {
        q,
        status,
        priority,
        breached,
        assignee,
        requester,
        projectId: projectParam,
      })
    );
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
        <SelectItem value="__none__">{labels.none}</SelectItem>
        {projects.map((p) => (
          <SelectItem key={p.id} value={p.id}>
            {p.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
