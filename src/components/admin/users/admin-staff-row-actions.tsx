"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, Eye, Mail, MoreHorizontal, Pencil } from "lucide-react";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

function copyText(text: string, okSq: string, okEn: string, locale: string) {
  void navigator.clipboard.writeText(text).then(
    () => toast.success(locale === "sq" ? okSq : okEn),
    () => toast.error(locale === "sq" ? "Kopjimi dështoi" : "Copy failed")
  );
}

export type AdminStaffActionRow = {
  id: string;
  email: string;
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
}: {
  member: AdminStaffActionRow;
  locale: string;
  /** e.g. `/admin` or `/en/admin` (no trailing slash). */
  adminHrefPrefix: string;
  /** Locale prefix for messages routes, e.g. `` or `/en`. */
  messagesBasePath: string;
  currentUserId: string;
  canMessage: boolean;
}) {
  const en = locale === "en";
  const t = (sq: string, e: string) => (en ? e : sq);
  const [sheetOpen, setSheetOpen] = useState(false);

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
      <DropdownMenuItem
        onClick={() => copyText(member.email, "Emaili u kopjua", "Email copied", locale)}
      >
        <Copy className="mr-2 h-4 w-4" />
        {t("Kopjo emailin", "Copy email")}
      </DropdownMenuItem>
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
      <Button
        variant="secondary"
        className="h-auto w-full justify-start py-2.5 font-normal"
        onClick={() => {
          copyText(member.email, "Emaili u kopjua", "Email copied", locale);
          setSheetOpen(false);
        }}
      >
        <Copy className="mr-2 h-4 w-4 shrink-0" />
        {t("Kopjo emailin", "Copy email")}
      </Button>
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
    </div>
  );

  return (
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
  );
}
