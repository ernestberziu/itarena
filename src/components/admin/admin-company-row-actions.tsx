"use client";
import { useUiT } from "@/hooks/use-ui-t";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Eye,
  MoreHorizontal,
  Pencil,
  Trash2,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDangerDialog } from "@/components/admin/users/confirm-danger-dialog";
import type { AdminCompanyRow } from "@/types/admin-company";

export function AdminCompanyRowActions({
  company,
  locale,
  lp,
}: {
  company: AdminCompanyRow;
  locale: string;
  lp: string;
}) {
  const router = useRouter();
  const en = locale === "en";
  const tUi = useUiT();
  const detailHref = `${lp}/admin/companies/${company.id}`;
  const [danger, setDanger] = useState(false);
  const [loading, setLoading] = useState(false);

  async function deleteCompany() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/companies/${company.id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? "Request failed");
      }
      toast.success(tUi("company_deleted"));
      setDanger(false);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : tUi("error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" size="icon" className="h-8 w-8" aria-label={tUi("actions")} />
            }
          >
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-52 bg-white dark:bg-white">
            <DropdownMenuItem render={<Link href={detailHref} />}>
              <Eye className="mr-2 h-4 w-4" />
              {tUi("view")}
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href={`${detailHref}#edit`} />}>
              <Pencil className="mr-2 h-4 w-4" />
              {tUi("edit")}
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href={`${detailHref}#members`} />}>
              <UserPlus className="mr-2 h-4 w-4" />
              {tUi("members")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => setDanger(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {tUi("delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ConfirmDangerDialog
        open={danger}
        onOpenChange={setDanger}
        title={tUi("delete_company")}
        description={tUi("only_companies_with_no_linked_users_tickets_or_o")}
        confirmLabel={tUi("delete")}
        cancelLabel={tUi("cancel")}
        loading={loading}
        onConfirm={deleteCompany}
      />
    </>
  );
}
