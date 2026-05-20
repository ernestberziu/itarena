"use client";

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
  const t = (sq: string, e: string) => (en ? e : sq);
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
            ? t(
                "Nuk mund të hiqet administratori i fundit aktiv.",
                "Cannot remove the last active administrator."
              )
            : json.error === "You cannot remove your own account."
              ? t("Nuk mund ta hiqni llogarinë tuaj.", "You cannot remove your own account.")
              : json.error ?? t("Gabim", "Error");
        throw new Error(msg);
      }

      toast.success(
        t(
          "Stafi u hoq. Biletat dhe projektet mbeten; caktimet u shlyen.",
          "Staff member removed. Tickets and projects remain; assignments were cleared."
        )
      );
      setOpen(false);
      if (redirectAfterRemove) {
        router.push(`${lp}/admin/staff`);
        router.refresh();
      } else {
        router.refresh();
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("Gabim", "Error"));
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
        {t("Hiq stafin", "Remove staff")}
      </Button>

      <ConfirmDangerDialog
        open={open}
        onOpenChange={setOpen}
        title={t("Hiq stafin?", "Remove staff member?")}
        description={t(
          `${staffName} do të hiqet nga stafi. Biletat, projektet, komentet dhe mesazhet mbeten; vetëm caktimet aktive (bileta, projekte, biseda) do të shlyhen.`,
          `${staffName} will be removed from staff. Tickets, projects, comments, and messages stay intact; only active assignments (tickets, projects, conversations) will be cleared.`
        )}
        confirmLabel={t("Hiq", "Remove")}
        cancelLabel={t("Anulo", "Cancel")}
        loading={loading}
        onConfirm={removeStaff}
      />
    </>
  );
}
