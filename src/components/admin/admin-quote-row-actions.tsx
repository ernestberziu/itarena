"use client";
import { useUiT } from "@/hooks/use-ui-t";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  ExternalLink,
  Eye,
  FileDown,
  MoreHorizontal,
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
import { EmailClientButton } from "@/components/admin/email-client-button";
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
  const tUi = useUiT();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const backendSoon = tUi("requires_backend_support");

  async function applyStatus(status: string): Promise<boolean> {
    setLoading(true);
    try {
      await patchQuote(quoteId, { status });
      toast.success(tUi("status_updated"));
      setSheetOpen(false);
      router.refresh();
      return true;
    } catch {
      toast.error(tUi("update_failed"));
      return false;
    } finally {
      setLoading(false);
    }
  }

  const menuItems = (
    <>
      <DropdownMenuItem render={<Link href={detailHref} />}>
        <Eye className="mr-2 h-4 w-4 opacity-70" />
        {tUi("view_quote")}
      </DropdownMenuItem>
      {pdfUrl ? (
        <DropdownMenuItem render={<a href={pdfUrl} target="_blank" rel="noreferrer" />}>
          <FileDown className="mr-2 h-4 w-4 opacity-70" />
          {tUi("open_pdf")}
          <ExternalLink className="ml-auto h-3 w-3 opacity-50" />
        </DropdownMenuItem>
      ) : null}
      <DropdownMenuSeparator />
      <DropdownMenuItem
        disabled={currentStatus === "ACCEPTED"}
        onClick={() => setApproveOpen(true)}
      >
        <Check className="mr-2 h-4 w-4 text-emerald-600" />
        {tUi("approve")}
      </DropdownMenuItem>
      <DropdownMenuItem
        disabled={currentStatus === "REJECTED"}
        variant="destructive"
        onClick={() => setRejectOpen(true)}
      >
        <X className="mr-2 h-4 w-4" />
        {tUi("reject")}
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>{tUi("set_status")}</DropdownMenuSubTrigger>
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
      <DropdownMenuItem
        onClick={(e) => {
          e.preventDefault();
          void fetch(`/api/admin/quotes/${quoteId}/email-client`, { method: "POST" })
            .then(async (res) => {
              const json = (await res.json().catch(() => ({}))) as { error?: string; emailSent?: boolean };
              if (!res.ok) throw new Error(json.error ?? "Failed");
              if (json.emailSent) toast.success(tUi("email_sent"));
              else toast.warning(tUi("smtp_not_configured"));
            })
            .catch((err) => toast.error(err instanceof Error ? err.message : "Error"));
        }}
      >
        {tUi("send_email")}
      </DropdownMenuItem>
      <DropdownMenuItem disabled title={backendSoon}>
        {tUi("delete")}
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
                aria-label={tUi("actions")}
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
                aria-label={tUi("actions")}
              />
            }
          >
            <MoreHorizontal className="h-4 w-4" />
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[85vh] rounded-t-2xl">
            <SheetHeader className="text-left">
              <SheetTitle>{tUi("actions")}</SheetTitle>
            </SheetHeader>
            <div className="mt-4 flex flex-col gap-2 pb-6">
              <Button variant="secondary" className="h-auto w-full justify-start py-2.5 font-normal" asChild>
                <Link href={detailHref} onClick={() => setSheetOpen(false)}>
                  <Eye className="mr-2 h-4 w-4 shrink-0" />
                  {tUi("view_quote")}
                </Link>
              </Button>
              {pdfUrl ? (
                <Button variant="secondary" className="h-auto w-full justify-start py-2.5 font-normal" asChild>
                  <a href={pdfUrl} target="_blank" rel="noreferrer" onClick={() => setSheetOpen(false)}>
                    <FileDown className="mr-2 h-4 w-4 shrink-0" />
                    {tUi("open_pdf")}
                  </a>
                </Button>
              ) : null}
              <Button
                variant="accent"
                className="h-auto w-full justify-start py-2.5 font-normal"
                disabled={currentStatus === "ACCEPTED" || loading}
                onClick={() => {
                  setSheetOpen(false);
                  setApproveOpen(true);
                }}
              >
                <Check className="mr-2 h-4 w-4 shrink-0" />
                {tUi("approve")}
              </Button>
              <Button
                variant="destructive"
                className="h-auto w-full justify-start py-2.5 font-normal"
                disabled={currentStatus === "REJECTED" || loading}
                onClick={() => {
                  setSheetOpen(false);
                  setRejectOpen(true);
                }}
              >
                <X className="mr-2 h-4 w-4 shrink-0" />
                {tUi("reject")}
              </Button>
              <p className="pt-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {tUi("status")}
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
        title={tUi("approve_this_quote")}
        description={tUi("the_client_will_see_the_quote_as_accepted")}
        confirmLabel={tUi("approve")}
        cancelLabel={tUi("cancel")}
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
        title={tUi("reject_this_quote")}
        description={tUi("this_marks_the_quote_as_rejected")}
        confirmLabel={tUi("reject")}
        cancelLabel={tUi("cancel")}
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
