"use client";
import { useUiT } from "@/hooks/use-ui-t";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDangerDialog } from "@/components/admin/users/confirm-danger-dialog";

export function AdminStaffRemoveButton({
  staffId,
  staffName,
  locale,
  lp,
  canRemove,
  variant = "outline",
  className,
  redirectAfterRemove = false,
}: {
  staffId: string;
  staffName: string;
  locale: string;
  lp: string;
  canRemove: boolean;
  variant?: "outline" | "destructive" | "secondary";
  className?: string;
  redirectAfterRemove?: boolean;
}) {
  const router = useRouter();
  const en = locale === "en";
  const tUi = useUiT();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!canRemove) return null;

  async function removeStaff() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/staff/${staffId}`, { method: "DELETE" });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        const msg =
          json.error === "Cannot remove the last active administrator."
            ? tUi("cannot_remove_the_last_active_administrator")
            : json.error === "You cannot remove your own account."
              ? tUi("you_cannot_remove_your_own_account")
              : json.error ?? tUi("error");
        throw new Error(msg);
      }

      toast.success(
        tUi("staff_member_removed_tickets_and_projects_remain")
      );
      setOpen(false);
      if (redirectAfterRemove) {
        router.push(`${lp}/admin/staff`);
        router.refresh();
      } else {
        router.refresh();
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : tUi("error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size="sm"
        className={className}
        onClick={() => setOpen(true)}
      >
        <Trash2 className="mr-2 h-4 w-4" strokeWidth={2} />
        {tUi("remove_staff")}
      </Button>

      <ConfirmDangerDialog
        open={open}
        onOpenChange={setOpen}
        title={tUi("remove_staff_member")}
        description={tUi("remove_staff_desc", { name: staffName })}
        confirmLabel={tUi("remove")}
        cancelLabel={tUi("cancel")}
        loading={loading}
        onConfirm={removeStaff}
      />
    </>
  );
}
