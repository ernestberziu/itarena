"use client";
import { useUiT } from "@/hooks/use-ui-t";

import { useState } from "react";
import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Priority } from "@/types/domain";
import {
  AdminTicketOpsForm,
  type EngineerOption,
  type ProjectOption,
} from "@/components/admin/admin-ticket-ops-form";

export function AdminTicketOpsSheet({
  ticketId,
  locale,
  engineers,
  projects,
  assignedToId,
  projectId,
  priority,
  estimatedDays,
  estimatedHours,
}: {
  ticketId: string;
  locale: string;
  engineers: EngineerOption[];
  projects: ProjectOption[];
  assignedToId: string | null;
  projectId: string | null;
  priority: Priority;
  estimatedDays: number | null;
  estimatedHours: number | null;
}) {
  const tUi = useUiT();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="gap-1.5 border-border/60 bg-background shadow-sm lg:hidden"
        onClick={() => setOpen(true)}
      >
        <Settings2 className="h-4 w-4" strokeWidth={2} />
        {tUi("ops")}
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="flex w-[min(100vw,24rem)] flex-col gap-0 p-0">
          <SheetHeader className="border-b border-border/60 px-5 py-4 text-left">
            <SheetTitle className="text-base font-semibold">
              {tUi("manage_ticket")}
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-5 py-5 pb-8">
            <AdminTicketOpsForm
              key={`${ticketId}-${assignedToId ?? "none"}-${projectId ?? "np"}-${priority}-${estimatedDays ?? "n"}-${estimatedHours ?? "n"}`}
              ticketId={ticketId}
              locale={locale}
              engineers={engineers}
              projects={projects}
              assignedToId={assignedToId}
              projectId={projectId}
              priority={priority}
              estimatedDays={estimatedDays}
              estimatedHours={estimatedHours}
              onSaved={() => setOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
