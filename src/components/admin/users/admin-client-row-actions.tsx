"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Copy,
  Eye,
  Mail,
  MoreHorizontal,
  Package,
  Pencil,
  Ticket,
  Trash2,
  UserX,
  UserCheck,
} from "lucide-react";
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

export type AdminClientActionRow = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
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
}: {
  user: AdminClientActionRow;
  locale: string;
  detailHref: string;
  ticketsHref: string;
  ordersHref: string;
}) {
  const router = useRouter();
  const en = locale === "en";
  const t = (sq: string, e: string) => (en ? e : sq);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [danger, setDanger] = useState<null | "delete" | "suspend" | "activate">(null);
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
      toast.success(t("Klienti u fshi", "Client removed"));
      setDanger(null);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("Gabim", "Error"));
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
          ? t("Llogaria u aktivizua", "Account activated")
          : t("Llogaria u pezullua", "Account suspended")
      );
      setDanger(null);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("Gabim", "Error"));
    } finally {
      setLoading(false);
    }
  }

  const menuItems = (
    <>
      <DropdownMenuItem render={<Link href={detailHref} />}>
        <Eye className="mr-2 h-4 w-4" />
        {t("Shiko klientin", "View customer")}
      </DropdownMenuItem>
      <DropdownMenuItem render={<Link href={`${detailHref}#account`} />}>
        <Pencil className="mr-2 h-4 w-4" />
        {t("Ndrysho", "Edit")}
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem render={<Link href={ticketsHref} />}>
        <Ticket className="mr-2 h-4 w-4" />
        {t("Biletat", "Tickets")}
      </DropdownMenuItem>
      <DropdownMenuItem render={<Link href={ordersHref} />}>
        <Package className="mr-2 h-4 w-4" />
        {t("Porositë", "Orders")}
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onClick={() => copyText(user.email, "Emaili u kopjua", "Email copied", locale)}
      >
        <Copy className="mr-2 h-4 w-4" />
        {t("Kopjo emailin", "Copy email")}
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => copyText(user.id, "ID u kopjua", "ID copied", locale)}>
        <Copy className="mr-2 h-4 w-4" />
        {t("Kopjo ID", "Copy ID")}
      </DropdownMenuItem>
      <DropdownMenuItem render={<a href={`mailto:${user.email}`} />}>
        <Mail className="mr-2 h-4 w-4" />
        {t("Dërgo email", "Send email")}
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      {user.isActive ? (
        <DropdownMenuItem
          className="text-amber-700 focus:text-amber-800 dark:text-amber-400"
          onClick={() => setDanger("suspend")}
        >
          <UserX className="mr-2 h-4 w-4" />
          {t("Pezullo", "Suspend")}
        </DropdownMenuItem>
      ) : (
        <DropdownMenuItem
          className="text-emerald-700 focus:text-emerald-800 dark:text-emerald-400"
          onClick={() => setDanger("activate")}
        >
          <UserCheck className="mr-2 h-4 w-4" />
          {t("Aktivizo", "Activate")}
        </DropdownMenuItem>
      )}
      <DropdownMenuItem
        className="text-destructive focus:text-destructive"
        onClick={() => setDanger("delete")}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        {t("Fshi", "Delete")}
      </DropdownMenuItem>
    </>
  );

  const sheetLinks = (
    <div className="flex flex-col gap-1 p-2">
      <Button variant="secondary" className="h-auto w-full justify-start py-2.5 font-normal" asChild>
        <Link href={detailHref} onClick={() => setSheetOpen(false)}>
          <Eye className="mr-2 h-4 w-4 shrink-0" />
          {t("Shiko klientin", "View customer")}
        </Link>
      </Button>
      <Button variant="secondary" className="h-auto w-full justify-start py-2.5 font-normal" asChild>
        <Link href={`${detailHref}#account`} onClick={() => setSheetOpen(false)}>
          <Pencil className="mr-2 h-4 w-4 shrink-0" />
          {t("Ndrysho", "Edit")}
        </Link>
      </Button>
      <Button variant="secondary" className="h-auto w-full justify-start py-2.5 font-normal" asChild>
        <Link href={ticketsHref} onClick={() => setSheetOpen(false)}>
          <Ticket className="mr-2 h-4 w-4 shrink-0" />
          {t("Biletat", "Tickets")}
        </Link>
      </Button>
      <Button variant="secondary" className="h-auto w-full justify-start py-2.5 font-normal" asChild>
        <Link href={ordersHref} onClick={() => setSheetOpen(false)}>
          <Package className="mr-2 h-4 w-4 shrink-0" />
          {t("Porositë", "Orders")}
        </Link>
      </Button>
      <Button
        variant="secondary"
        className="h-auto w-full justify-start py-2.5 font-normal"
        onClick={() => {
          copyText(user.email, "Emaili u kopjua", "Email copied", locale);
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
          copyText(user.id, "ID u kopjua", "ID copied", locale);
          setSheetOpen(false);
        }}
      >
        <Copy className="mr-2 h-4 w-4 shrink-0" />
        {t("Kopjo ID", "Copy ID")}
      </Button>
      <Button variant="secondary" className="h-auto w-full justify-start py-2.5 font-normal" asChild>
        <a href={`mailto:${user.email}`}>
          <Mail className="mr-2 h-4 w-4 shrink-0" />
          {t("Dërgo email", "Send email")}
        </a>
      </Button>
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
          {t("Pezullo", "Suspend")}
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
          {t("Aktivizo", "Activate")}
        </Button>
      )}
      <Button
        variant="secondary"
        className="h-auto w-full justify-start py-2.5 font-normal text-destructive"
        onClick={() => {
          setSheetOpen(false);
          setDanger("delete");
        }}
      >
        <Trash2 className="mr-2 h-4 w-4 shrink-0" />
        {t("Fshi", "Delete")}
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
                  aria-label={t("Veprime", "Actions")}
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
                  aria-label={t("Veprime", "Actions")}
                />
              }
            >
              <MoreHorizontal className="h-4 w-4" />
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl">
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
        title={t("Fshi klientin?", "Delete client?")}
        description={t(
          "Ky veprim është i përhershëm. Përdoruesi dhe të dhënat e lidhura mund të preken sipas politikës së sistemit.",
          "This action is permanent. Related data may be affected per system policy."
        )}
        confirmLabel={t("Fshi", "Delete")}
        cancelLabel={t("Anulo", "Cancel")}
        loading={loading}
        onConfirm={deleteUser}
      />

      <ConfirmDangerDialog
        open={danger === "suspend"}
        onOpenChange={(o) => !o && setDanger(null)}
        title={t("Pezullo llogarinë?", "Suspend account?")}
        description={t(
          "Klienti nuk do të mund të hyjë në portal derisa ta riaktivizoni.",
          "The client will not be able to sign in until you reactivate."
        )}
        confirmLabel={t("Pezullo", "Suspend")}
        cancelLabel={t("Anulo", "Cancel")}
        loading={loading}
        onConfirm={() => setActive(false)}
      />

      <ConfirmDangerDialog
        open={danger === "activate"}
        onOpenChange={(o) => !o && setDanger(null)}
        title={t("Aktivizo llogarinë?", "Activate account?")}
        description={t(
          "Klienti do të mund të përdorë përsëri portalin.",
          "The client will be able to use the portal again."
        )}
        confirmLabel={t("Aktivizo", "Activate")}
        cancelLabel={t("Anulo", "Cancel")}
        loading={loading}
        confirmVariant="default"
        onConfirm={() => setActive(true)}
      />
    </>
  );
}
