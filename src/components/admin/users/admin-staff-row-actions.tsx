"use client";
import { useUiT } from "@/hooks/use-ui-t";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, Eye, Mail, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  StartDirectMessageButton,
  StartDirectMessageMenuItem,
} from "@/components/admin/messages/start-direct-message-action";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ConfirmDangerDialog } from "@/components/admin/users/confirm-danger-dialog";

function copyText(text: string, okSq: string, okEn: string, locale: string) {
  void navigator.clipboard.writeText(text).then(
    () => toast.success(locale === "sq" ? okSq : okEn),
    () => toast.error(locale === "sq" ? "Kopjimi dështoi" : "Copy failed")
  );
}

export type AdminStaffActionRow = {
  id: string;
  email: string | null;
  firstName: string;
  lastName: string;
};

export function AdminStaffRowActions({
  member,
  locale,
  adminHrefPrefix,
  messagesBasePath,
  currentUserId,
  canMessage,
  canRemove,
}: {
  member: AdminStaffActionRow;
  locale: string;
  /** e.g. `/admin` or `/en/admin` (no trailing slash). */
  adminHrefPrefix: string;
  /** Locale prefix for messages routes, e.g. `` or `/en`. */
  messagesBasePath: string;
  currentUserId: string;
  canMessage: boolean;
  canRemove?: boolean;
}) {
  const router = useRouter();
  const en = locale === "en";
  const tUi = useUiT();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function removeStaff() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/staff/${member.id}`, { method: "DELETE" });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        const msg =
          json.error === "Cannot remove the last active administrator."
            ? tUi("cannot_remove_the_last_active_administrator")
            : json.error ?? tUi("error");
        throw new Error(msg);
      }
      toast.success(
        tUi("staff_member_removed_tickets_and_projects_remain")
      );
      setRemoveOpen(false);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : tUi("error"));
    } finally {
      setLoading(false);
    }
  }

  const removeItem = canRemove ? (
    <>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        className="text-destructive focus:text-destructive"
        onClick={() => setRemoveOpen(true)}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        {tUi("remove_staff")}
      </DropdownMenuItem>
    </>
  ) : null;

  const items = (
    <>
      <DropdownMenuItem render={<Link href={`${adminHrefPrefix}/staff/${member.id}`} />}>
        <Eye className="mr-2 h-4 w-4" />
        {tUi("view")}
      </DropdownMenuItem>
      <DropdownMenuItem render={<Link href={`${adminHrefPrefix}/staff/${member.id}`} />}>
        <Pencil className="mr-2 h-4 w-4" />
        {tUi("edit")}
      </DropdownMenuItem>
      {member.email ? (
        <DropdownMenuItem
          onClick={() => copyText(member.email!, "Emaili u kopjua", "Email copied", locale)}
        >
          <Copy className="mr-2 h-4 w-4" />
          {tUi("copy_email")}
        </DropdownMenuItem>
      ) : null}
      <DropdownMenuItem onClick={() => copyText(member.id, "ID u kopjua", "ID copied", locale)}>
        <Copy className="mr-2 h-4 w-4" />
        {tUi("copy_id")}
      </DropdownMenuItem>
      <DropdownMenuItem render={<a href={`mailto:${member.email}`} />}>
        <Mail className="mr-2 h-4 w-4" />
        {tUi("send_email")}
      </DropdownMenuItem>
      <StartDirectMessageMenuItem
        participantId={member.id}
        currentUserId={currentUserId}
        locale={locale}
        messagesBasePath={messagesBasePath}
        enabled={canMessage}
        withSeparatorBefore
      />
      {removeItem}
    </>
  );

  const sheetBlock = (
    <div className="flex flex-col gap-1 p-2">
      <Button variant="secondary" className="h-auto w-full justify-start py-2.5 font-normal" asChild>
        <Link href={`${adminHrefPrefix}/staff/${member.id}`} onClick={() => setSheetOpen(false)}>
          <Eye className="mr-2 h-4 w-4 shrink-0" />
          {tUi("view")}
        </Link>
      </Button>
      <Button variant="secondary" className="h-auto w-full justify-start py-2.5 font-normal" asChild>
        <Link href={`${adminHrefPrefix}/staff/${member.id}`} onClick={() => setSheetOpen(false)}>
          <Pencil className="mr-2 h-4 w-4 shrink-0" />
          {tUi("edit")}
        </Link>
      </Button>
      {member.email ? (
        <Button
          variant="secondary"
          className="h-auto w-full justify-start py-2.5 font-normal"
          onClick={() => {
            copyText(member.email!, "Emaili u kopjua", "Email copied", locale);
            setSheetOpen(false);
          }}
        >
          <Copy className="mr-2 h-4 w-4 shrink-0" />
          {tUi("copy_email")}
        </Button>
      ) : null}
      <Button
        variant="secondary"
        className="h-auto w-full justify-start py-2.5 font-normal"
        onClick={() => {
          copyText(member.id, "ID u kopjua", "ID copied", locale);
          setSheetOpen(false);
        }}
      >
        <Copy className="mr-2 h-4 w-4 shrink-0" />
        {tUi("copy_id")}
      </Button>
      <Button variant="secondary" className="h-auto w-full justify-start py-2.5 font-normal" asChild>
        <a href={`mailto:${member.email}`}>
          <Mail className="mr-2 h-4 w-4 shrink-0" />
          {tUi("send_email")}
        </a>
      </Button>
      <StartDirectMessageButton
        participantId={member.id}
        currentUserId={currentUserId}
        locale={locale}
        messagesBasePath={messagesBasePath}
        enabled={canMessage}
        className="h-auto w-full justify-start py-2.5 font-normal"
        variant="secondary"
      />
      {canRemove ? (
        <Button
          variant="destructive"
          className="h-auto w-full justify-start py-2.5 font-normal"
          onClick={() => {
            setSheetOpen(false);
            setRemoveOpen(true);
          }}
        >
          <Trash2 className="mr-2 h-4 w-4 shrink-0" />
          {tUi("remove_staff")}
        </Button>
      ) : null}
    </div>
  );

  return (
    <>
      <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
        <div className="hidden sm:block">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  aria-label={tUi("actions")}
                />
              }
            >
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-44">
              {items}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="sm:hidden">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  aria-label={tUi("actions")}
                />
              }
            >
              <MoreHorizontal className="h-4 w-4" />
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl">
              <SheetHeader>
                <SheetTitle>
                  {member.firstName} {member.lastName}
                </SheetTitle>
              </SheetHeader>
              {sheetBlock}
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <ConfirmDangerDialog
        open={removeOpen}
        onOpenChange={setRemoveOpen}
        title={tUi("remove_staff_member")}
        description={tUi("remove_staff_member_desc", {
          name: `${member.firstName} ${member.lastName}`,
        })}
        confirmLabel={tUi("remove")}
        cancelLabel={tUi("cancel")}
        loading={loading}
        onConfirm={removeStaff}
      />
    </>
  );
}
