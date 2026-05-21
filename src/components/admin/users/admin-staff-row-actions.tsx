"use client";

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
  const t = (sq: string, e: string) => (en ? e : sq);
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
            ? t(
                "Nuk mund të hiqet administratori i fundit aktiv.",
                "Cannot remove the last active administrator."
              )
            : json.error ?? t("Gabim", "Error");
        throw new Error(msg);
      }
      toast.success(
        t(
          "Stafi u hoq. Biletat dhe projektet mbeten; caktimet u shlyen.",
          "Staff member removed. Tickets and projects remain; assignments were cleared."
        )
      );
      setRemoveOpen(false);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("Gabim", "Error"));
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
        {t("Hiq stafin", "Remove staff")}
      </DropdownMenuItem>
    </>
  ) : null;

  const items = (
    <>
      <DropdownMenuItem render={<Link href={`${adminHrefPrefix}/staff/${member.id}`} />}>
        <Eye className="mr-2 h-4 w-4" />
        {t("Shiko", "View")}
      </DropdownMenuItem>
      <DropdownMenuItem render={<Link href={`${adminHrefPrefix}/staff/${member.id}`} />}>
        <Pencil className="mr-2 h-4 w-4" />
        {t("Ndrysho", "Edit")}
      </DropdownMenuItem>
      {member.email ? (
        <DropdownMenuItem
          onClick={() => copyText(member.email!, "Emaili u kopjua", "Email copied", locale)}
        >
          <Copy className="mr-2 h-4 w-4" />
          {t("Kopjo emailin", "Copy email")}
        </DropdownMenuItem>
      ) : null}
      <DropdownMenuItem onClick={() => copyText(member.id, "ID u kopjua", "ID copied", locale)}>
        <Copy className="mr-2 h-4 w-4" />
        {t("Kopjo ID", "Copy ID")}
      </DropdownMenuItem>
      <DropdownMenuItem render={<a href={`mailto:${member.email}`} />}>
        <Mail className="mr-2 h-4 w-4" />
        {t("Dërgo email", "Send email")}
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
          {t("Shiko", "View")}
        </Link>
      </Button>
      <Button variant="secondary" className="h-auto w-full justify-start py-2.5 font-normal" asChild>
        <Link href={`${adminHrefPrefix}/staff/${member.id}`} onClick={() => setSheetOpen(false)}>
          <Pencil className="mr-2 h-4 w-4 shrink-0" />
          {t("Ndrysho", "Edit")}
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
          {t("Kopjo emailin", "Copy email")}
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
        {t("Kopjo ID", "Copy ID")}
      </Button>
      <Button variant="secondary" className="h-auto w-full justify-start py-2.5 font-normal" asChild>
        <a href={`mailto:${member.email}`}>
          <Mail className="mr-2 h-4 w-4 shrink-0" />
          {t("Dërgo email", "Send email")}
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
          variant="secondary"
          className="h-auto w-full justify-start py-2.5 font-normal text-destructive"
          onClick={() => {
            setSheetOpen(false);
            setRemoveOpen(true);
          }}
        >
          <Trash2 className="mr-2 h-4 w-4 shrink-0" />
          {t("Hiq stafin", "Remove staff")}
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
                  aria-label={t("Veprime", "Actions")}
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
                  aria-label={t("Veprime", "Actions")}
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
        title={t("Hiq stafin?", "Remove staff member?")}
        description={t(
          `${member.firstName} ${member.lastName} do të hiqet nga stafi. Biletat, projektet, komentet dhe mesazhet mbeten; vetëm caktimet aktive shlyhen.`,
          `${member.firstName} ${member.lastName} will be removed from staff. Tickets, projects, comments, and messages stay intact; only active assignments are cleared.`
        )}
        confirmLabel={t("Hiq", "Remove")}
        cancelLabel={t("Anulo", "Cancel")}
        loading={loading}
        onConfirm={removeStaff}
      />
    </>
  );
}
