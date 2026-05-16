"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  ExternalLink,
  Eye,
  FileDown,
  MoreHorizontal,
  Pencil,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ConfirmDangerDialog } from "@/components/admin/users/confirm-danger-dialog";
import { QUOTE_STATUSES, STATUS_LABELS } from "@/lib/admin-quote-status";

const STATUS_ORDER = QUOTE_STATUSES;

async function patchQuote(quoteId: string, body: Record<string, unknown>) {
  const res = await fetch(`/api/quotes/${quoteId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("patch failed");
}

export function AdminQuoteRowActions({
  quoteId,
  detailHref,
  currentStatus,
  locale,
  pdfUrl,
}: {
  quoteId: string;
  detailHref: string;
  currentStatus: string;
  locale: string;
  pdfUrl?: string | null;
}) {
  const en = locale === "en";
  const t = (sq: string, e: string) => (en ? e : sq);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const backendSoon = t("Kërkon mbështetje në server.", "Requires backend support.");

  async function applyStatus(status: string): Promise<boolean> {
    setLoading(true);
    try {
      await patchQuote(quoteId, { status });
      toast.success(t("Statusi u përditësua", "Status updated"));
      setSheetOpen(false);
      router.refresh();
      return true;
    } catch {
      toast.error(t("Gabim gjatë përditësimit", "Update failed"));
      return false;
    } finally {
      setLoading(false);
    }
  }

  const menuItems = (
    <>
      <DropdownMenuItem render={<Link href={detailHref} />}>
        <Eye className="mr-2 h-4 w-4 opacity-70" />
        {t("Shiko ofertën", "View quote")}
      </DropdownMenuItem>
      <DropdownMenuItem render={<Link href={detailHref} />}>
        <Pencil className="mr-2 h-4 w-4 opacity-70" />
        {t("Ndrysho (stafi)", "Edit (staff)")}
      </DropdownMenuItem>
      {pdfUrl ? (
        <DropdownMenuItem render={<a href={pdfUrl} target="_blank" rel="noreferrer" />}>
          <FileDown className="mr-2 h-4 w-4 opacity-70" />
          {t("Hap PDF", "Open PDF")}
          <ExternalLink className="ml-auto h-3 w-3 opacity-50" />
        </DropdownMenuItem>
      ) : null}
      <DropdownMenuSeparator />
      <DropdownMenuItem
        disabled={currentStatus === "ACCEPTED"}
        onClick={() => setApproveOpen(true)}
      >
        <Check className="mr-2 h-4 w-4 text-emerald-600" />
        {t("Prano", "Approve")}
      </DropdownMenuItem>
      <DropdownMenuItem
        disabled={currentStatus === "REJECTED"}
        variant="destructive"
        onClick={() => setRejectOpen(true)}
      >
        <X className="mr-2 h-4 w-4" />
        {t("Refuzo", "Reject")}
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>{t("Ndrysho statusin", "Set status")}</DropdownMenuSubTrigger>
        <DropdownMenuSubContent className="max-h-64 overflow-y-auto">
          {STATUS_ORDER.map((s) => (
            <DropdownMenuItem
              key={s}
              disabled={s === currentStatus || loading}
              onClick={() => void applyStatus(s)}
            >
              {STATUS_LABELS[s] ? (en ? STATUS_LABELS[s].en : STATUS_LABELS[s].sq) : s}
            </DropdownMenuItem>
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuSub>
      <DropdownMenuSeparator />
      <DropdownMenuItem disabled title={backendSoon}>
        {t("Dublikato", "Duplicate")}
      </DropdownMenuItem>
      <DropdownMenuItem disabled title={backendSoon}>
        {t("Shndërro në porosi", "Convert to order")}
      </DropdownMenuItem>
      <DropdownMenuItem disabled title={backendSoon}>
        {t("Dërgo email", "Send email")}
      </DropdownMenuItem>
      <DropdownMenuItem disabled title={backendSoon}>
        {t("Arkivo", "Archive")}
      </DropdownMenuItem>
      <DropdownMenuItem disabled title={backendSoon}>
        {t("Fshi", "Delete")}
      </DropdownMenuItem>
    </>
  );

  return (
    <>
      <div className="hidden lg:block" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="h-8 w-8 shrink-0 border border-border shadow-sm"
                aria-label={t("Veprime", "Actions")}
              />
            }
          >
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            {menuItems}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="lg:hidden" onClick={(e) => e.stopPropagation()}>
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger
            render={
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="h-8 w-8 shrink-0 border border-border shadow-sm"
                aria-label={t("Veprime", "Actions")}
              />
            }
          >
            <MoreHorizontal className="h-4 w-4" />
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[85vh] rounded-t-2xl">
            <SheetHeader className="text-left">
              <SheetTitle>{t("Veprime", "Actions")}</SheetTitle>
            </SheetHeader>
            <div className="mt-4 flex flex-col gap-1 pb-6">
              <Button variant="secondary" className="h-auto justify-start py-2.5 font-normal" asChild>
                <Link href={detailHref} onClick={() => setSheetOpen(false)}>
                  <Eye className="mr-2 h-4 w-4 shrink-0" />
                  {t("Shiko ofertën", "View quote")}
                </Link>
              </Button>
              <Button variant="secondary" className="h-auto justify-start py-2.5 font-normal" asChild>
                <Link href={detailHref} onClick={() => setSheetOpen(false)}>
                  <Pencil className="mr-2 h-4 w-4 shrink-0" />
                  {t("Ndrysho", "Edit")}
                </Link>
              </Button>
              {pdfUrl ? (
                <Button variant="secondary" className="h-auto justify-start py-2.5 font-normal" asChild>
                  <a href={pdfUrl} target="_blank" rel="noreferrer" onClick={() => setSheetOpen(false)}>
                    <FileDown className="mr-2 h-4 w-4 shrink-0" />
                    {t("Hap PDF", "Open PDF")}
                  </a>
                </Button>
              ) : null}
              <Button
                variant="accent"
                className="h-auto justify-start py-2.5 font-normal"
                disabled={currentStatus === "ACCEPTED" || loading}
                onClick={() => {
                  setSheetOpen(false);
                  setApproveOpen(true);
                }}
              >
                <Check className="mr-2 h-4 w-4 shrink-0" />
                {t("Prano", "Approve")}
              </Button>
              <Button
                variant="destructive"
                className="h-auto justify-start py-2.5 font-normal"
                disabled={currentStatus === "REJECTED" || loading}
                onClick={() => {
                  setSheetOpen(false);
                  setRejectOpen(true);
                }}
              >
                <X className="mr-2 h-4 w-4 shrink-0" />
                {t("Refuzo", "Reject")}
              </Button>
              <p className="pt-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {t("Statusi", "Status")}
              </p>
              <div className="flex max-h-40 flex-col gap-1 overflow-y-auto">
                {STATUS_ORDER.map((s) => (
                  <Button
                    key={s}
                    type="button"
                    variant={s === currentStatus ? "default" : "outline"}
                    size="sm"
                    className="justify-start font-normal"
                    disabled={loading || s === currentStatus}
                    onClick={() => void applyStatus(s)}
                  >
                    {STATUS_LABELS[s] ? (en ? STATUS_LABELS[s].en : STATUS_LABELS[s].sq) : s}
                  </Button>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <ConfirmDangerDialog
        open={approveOpen}
        onOpenChange={setApproveOpen}
        title={t("Prano ofertën?", "Approve this quote?")}
        description={t("Klienti do të shohë statusin e pranuar.", "The client will see the quote as accepted.")}
        confirmLabel={t("Prano", "Approve")}
        cancelLabel={t("Anulo", "Cancel")}
        confirmVariant="default"
        loading={loading}
        onConfirm={async () => {
          const ok = await applyStatus("ACCEPTED");
          if (ok) setApproveOpen(false);
        }}
      />

      <ConfirmDangerDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        title={t("Refuzo ofertën?", "Reject this quote?")}
        description={t("Ky veprim shënon ofertën si të refuzuar.", "This marks the quote as rejected.")}
        confirmLabel={t("Refuzo", "Reject")}
        cancelLabel={t("Anulo", "Cancel")}
        confirmVariant="destructive"
        loading={loading}
        onConfirm={async () => {
          const ok = await applyStatus("REJECTED");
          if (ok) setRejectOpen(false);
        }}
      />
    </>
  );
}
