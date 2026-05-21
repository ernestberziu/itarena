"use client";
import { useUiT } from "@/hooks/use-ui-t";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Copy,
  Eye,
  KeyRound,
  Mail,
  MoreHorizontal,
  Package,
  Pencil,
  Ticket,
  Trash2,
  UserX,
  UserCheck,
  Building2,
} from "lucide-react";
import { AdminClientResetPasswordDialog } from "@/components/admin/admin-client-reset-password-dialog";
import { AdminClientInviteDialog } from "@/components/admin/admin-client-invite-dialog";
import { AdminAssignCompanyDialog } from "@/components/admin/admin-assign-company-dialog";
import type { RegistrationCompanySnapshot } from "@/lib/registration-company-snapshot";
import {
  StartDirectMessageButton,
  StartDirectMessageMenuItem,
} from "@/components/admin/messages/start-direct-message-action";
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
import { adminWhiteDialogClassName } from "@/components/admin/admin-white-dialog";

export type AdminClientActionRow = {
  id: string;
  email: string | null;
  hasPortalAccess: boolean;
  firstName: string;
  lastName: string;
  isActive: boolean;
  companyId: string | null;
  registrationCompanySnapshot: RegistrationCompanySnapshot | null;
};

function copyText(text: string, okSq: string, okEn: string, locale: string) {
  void navigator.clipboard.writeText(text).then(
    () => toast.success(locale === "sq" ? okSq : okEn),
    () => toast.error(locale === "sq" ? "Kopjimi dështoi" : "Copy failed")
  );
}

export function AdminClientRowActions({
  user,
  locale,
  detailHref,
  ticketsHref,
  ordersHref,
  messagesBasePath,
  currentUserId,
  canMessage,
}: {
  user: AdminClientActionRow;
  locale: string;
  detailHref: string;
  ticketsHref: string;
  ordersHref: string;
  messagesBasePath: string;
  currentUserId: string;
  canMessage: boolean;
}) {
  const router = useRouter();
  const en = locale === "en";
  const tUi = useUiT();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [danger, setDanger] = useState<null | "delete" | "suspend" | "activate">(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function patchBody(body: Record<string, unknown>) {
    const res = await fetch(`/api/admin/clients/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { error?: string }).error ?? "Request failed");
    }
  }

  async function deleteUser() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/clients/${user.id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? "Request failed");
      }
      toast.success(tUi("client_removed"));
      setDanger(null);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : tUi("error"));
    } finally {
      setLoading(false);
    }
  }

  async function setActive(next: boolean) {
    setLoading(true);
    try {
      await patchBody({ isActive: next });
      toast.success(
        next
          ? tUi("account_activated")
          : tUi("account_suspended")
      );
      setDanger(null);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : tUi("error"));
    } finally {
      setLoading(false);
    }
  }

  const menuItems = (
    <>
      <DropdownMenuItem render={<Link href={detailHref} />}>
        <Eye className="mr-2 h-4 w-4" />
        {tUi("view_customer")}
      </DropdownMenuItem>
      <DropdownMenuItem render={<Link href={`${detailHref}#account`} />}>
        <Pencil className="mr-2 h-4 w-4" />
        {tUi("edit")}
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => setAssignOpen(true)}>
        <Building2 className="mr-2 h-4 w-4" />
        {tUi("assign_company")}
      </DropdownMenuItem>
      {user.hasPortalAccess ? (
        <DropdownMenuItem onClick={() => setResetOpen(true)}>
          <KeyRound className="mr-2 h-4 w-4" />
          {tUi("reset_password")}
        </DropdownMenuItem>
      ) : (
        <DropdownMenuItem onClick={() => setInviteOpen(true)}>
          <Mail className="mr-2 h-4 w-4" />
          {tUi("invite_to_portal")}
        </DropdownMenuItem>
      )}
      <DropdownMenuSeparator />
      <DropdownMenuItem render={<Link href={ticketsHref} />}>
        <Ticket className="mr-2 h-4 w-4" />
        {tUi("tickets")}
      </DropdownMenuItem>
      <DropdownMenuItem render={<Link href={ordersHref} />}>
        <Package className="mr-2 h-4 w-4" />
        {tUi("orders")}
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      {user.email ? (
        <>
          <DropdownMenuItem
            onClick={() => copyText(user.email!, "Emaili u kopjua", "Email copied", locale)}
          >
            <Copy className="mr-2 h-4 w-4" />
            {tUi("copy_email")}
          </DropdownMenuItem>
          <DropdownMenuItem render={<a href={`mailto:${user.email}`} />}>
            <Mail className="mr-2 h-4 w-4" />
            {tUi("send_email")}
          </DropdownMenuItem>
        </>
      ) : null}
      <DropdownMenuItem onClick={() => copyText(user.id, "ID u kopjua", "ID copied", locale)}>
        <Copy className="mr-2 h-4 w-4" />
        {tUi("copy_id")}
      </DropdownMenuItem>
      <StartDirectMessageMenuItem
        participantId={user.id}
        currentUserId={currentUserId}
        locale={locale}
        messagesBasePath={messagesBasePath}
        enabled={canMessage}
        withSeparatorBefore
      />
      <DropdownMenuSeparator />
      {user.isActive ? (
        <DropdownMenuItem
          className="text-amber-700 focus:text-amber-800 dark:text-amber-400"
          onClick={() => setDanger("suspend")}
        >
          <UserX className="mr-2 h-4 w-4" />
          {tUi("suspend")}
        </DropdownMenuItem>
      ) : (
        <DropdownMenuItem
          className="text-emerald-700 focus:text-emerald-800 dark:text-emerald-400"
          onClick={() => setDanger("activate")}
        >
          <UserCheck className="mr-2 h-4 w-4" />
          {tUi("activate")}
        </DropdownMenuItem>
      )}
      <DropdownMenuItem
        className="text-destructive focus:text-destructive"
        onClick={() => setDanger("delete")}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        {tUi("delete")}
      </DropdownMenuItem>
    </>
  );

  const sheetLinks = (
    <div className="flex flex-col gap-1 p-2">
      <Button variant="secondary" className="h-auto w-full justify-start py-2.5 font-normal" asChild>
        <Link href={detailHref} onClick={() => setSheetOpen(false)}>
          <Eye className="mr-2 h-4 w-4 shrink-0" />
          {tUi("view_customer")}
        </Link>
      </Button>
      <Button variant="secondary" className="h-auto w-full justify-start py-2.5 font-normal" asChild>
        <Link href={`${detailHref}#account`} onClick={() => setSheetOpen(false)}>
          <Pencil className="mr-2 h-4 w-4 shrink-0" />
          {tUi("edit")}
        </Link>
      </Button>
      <Button variant="secondary" className="h-auto w-full justify-start py-2.5 font-normal" asChild>
        <Link href={ticketsHref} onClick={() => setSheetOpen(false)}>
          <Ticket className="mr-2 h-4 w-4 shrink-0" />
          {tUi("tickets")}
        </Link>
      </Button>
      <Button variant="secondary" className="h-auto w-full justify-start py-2.5 font-normal" asChild>
        <Link href={ordersHref} onClick={() => setSheetOpen(false)}>
          <Package className="mr-2 h-4 w-4 shrink-0" />
          {tUi("orders")}
        </Link>
      </Button>
      <Button
        variant="secondary"
        className="h-auto w-full justify-start py-2.5 font-normal"
        onClick={() => {
          copyText(user.id, "ID u kopjua", "ID copied", locale);
          setSheetOpen(false);
        }}
      >
        <Copy className="mr-2 h-4 w-4 shrink-0" />
        {tUi("copy_id")}
      </Button>
      {user.email ? (
        <>
          <Button
            variant="secondary"
            className="h-auto w-full justify-start py-2.5 font-normal"
            onClick={() => {
              copyText(user.email!, "Emaili u kopjua", "Email copied", locale);
              setSheetOpen(false);
            }}
          >
            <Copy className="mr-2 h-4 w-4 shrink-0" />
            {tUi("copy_email")}
          </Button>
          <Button variant="secondary" className="h-auto w-full justify-start py-2.5 font-normal" asChild>
            <a href={`mailto:${user.email}`}>
              <Mail className="mr-2 h-4 w-4 shrink-0" />
              {tUi("send_email")}
            </a>
          </Button>
        </>
      ) : user.hasPortalAccess ? null : (
        <Button
          variant="secondary"
          className="h-auto w-full justify-start py-2.5 font-normal"
          onClick={() => {
            setSheetOpen(false);
            setInviteOpen(true);
          }}
        >
          <Mail className="mr-2 h-4 w-4 shrink-0" />
          {tUi("invite_to_portal")}
        </Button>
      )}
      <StartDirectMessageButton
        participantId={user.id}
        currentUserId={currentUserId}
        locale={locale}
        messagesBasePath={messagesBasePath}
        enabled={canMessage}
        className="h-auto w-full justify-start py-2.5 font-normal"
        variant="secondary"
      />
      {user.isActive ? (
        <Button
          variant="secondary"
          className="h-auto w-full justify-start py-2.5 font-normal text-amber-700"
          onClick={() => {
            setSheetOpen(false);
            setDanger("suspend");
          }}
        >
          <UserX className="mr-2 h-4 w-4 shrink-0" />
          {tUi("suspend")}
        </Button>
      ) : (
        <Button
          variant="secondary"
          className="h-auto w-full justify-start py-2.5 font-normal text-emerald-700"
          onClick={() => {
            setSheetOpen(false);
            setDanger("activate");
          }}
        >
          <UserCheck className="mr-2 h-4 w-4 shrink-0" />
          {tUi("activate")}
        </Button>
      )}
      <Button
        variant="destructive"
        className="h-auto w-full justify-start py-2.5 font-normal"
        onClick={() => {
          setSheetOpen(false);
          setDanger("delete");
        }}
      >
        <Trash2 className="mr-2 h-4 w-4 shrink-0" />
        {tUi("delete")}
      </Button>
    </div>
  );

  return (
    <>
      <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
        <div className="hidden md:block">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  aria-label={tUi("actions")}
                />
              }
            >
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-52">
              {menuItems}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="md:hidden">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  aria-label={tUi("actions")}
                />
              }
            >
              <MoreHorizontal className="h-4 w-4" />
            </SheetTrigger>
            <SheetContent side="bottom" className={`rounded-t-2xl ${adminWhiteDialogClassName}`}>
              <SheetHeader>
                <SheetTitle>
                  {user.firstName} {user.lastName}
                </SheetTitle>
              </SheetHeader>
              {sheetLinks}
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <ConfirmDangerDialog
        open={danger === "delete"}
        onOpenChange={(o) => !o && setDanger(null)}
        title={tUi("delete_client")}
        description={tUi("this_action_is_permanent_related_data_may_be_aff")}
        confirmLabel={tUi("delete")}
        cancelLabel={tUi("cancel")}
        loading={loading}
        onConfirm={deleteUser}
      />

      <ConfirmDangerDialog
        open={danger === "suspend"}
        onOpenChange={(o) => !o && setDanger(null)}
        title={tUi("suspend_account")}
        description={tUi("the_client_will_not_be_able_to_sign_in_until_you")}
        confirmLabel={tUi("suspend")}
        cancelLabel={tUi("cancel")}
        loading={loading}
        onConfirm={() => setActive(false)}
      />

      <ConfirmDangerDialog
        open={danger === "activate"}
        onOpenChange={(o) => !o && setDanger(null)}
        title={tUi("activate_account")}
        description={tUi("the_client_will_be_able_to_use_the_portal_again")}
        confirmLabel={tUi("activate")}
        cancelLabel={tUi("cancel")}
        loading={loading}
        confirmVariant="default"
        onConfirm={() => setActive(true)}
      />

      <AdminAssignCompanyDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        userId={user.id}
        locale={locale}
        currentCompanyId={user.companyId}
        registrationSnapshot={user.registrationCompanySnapshot}
        onAssigned={() => router.refresh()}
      />

      <AdminClientResetPasswordDialog
        userId={user.id}
        userEmail={user.email ?? ""}
        userName={`${user.firstName} ${user.lastName}`}
        locale={locale}
        open={resetOpen}
        onOpenChange={setResetOpen}
        hideTrigger
      />

      <AdminClientInviteDialog
        userId={user.id}
        userName={`${user.firstName} ${user.lastName}`}
        locale={locale}
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        hideTrigger
      />
    </>
  );
}
