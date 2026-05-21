"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, MoreHorizontal } from "lucide-react";
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
import { ORDER_STATUSES, STATUS_LABELS } from "@/lib/admin-order-status";

async function patchOrder(orderId: string, body: Record<string, unknown>) {
  const res = await fetch(`/api/orders/${orderId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("patch failed");
}

export function AdminOrderRowActions({
  orderId,
  detailHref,
  currentStatus,
  locale,
}: {
  orderId: string;
  detailHref: string;
  currentStatus: string;
  locale: string;
}) {
  const en = locale === "en";
  const t = (sq: string, e: string) => (en ? e : sq);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  async function applyStatus(status: string): Promise<boolean> {
    setLoading(true);
    try {
      await patchOrder(orderId, { status });
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
        {t("Shiko porosinë", "View order")}
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>{t("Ndrysho statusin", "Set status")}</DropdownMenuSubTrigger>
        <DropdownMenuSubContent className="max-h-64 overflow-y-auto">
          {ORDER_STATUSES.map((s) => (
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
            <div className="mt-4 flex flex-col gap-2 pb-6">
              <Button variant="secondary" className="h-auto w-full justify-start py-2.5 font-normal" asChild>
                <Link href={detailHref} onClick={() => setSheetOpen(false)}>
                  <Eye className="mr-2 h-4 w-4 shrink-0" />
                  {t("Shiko porosinë", "View order")}
                </Link>
              </Button>
              <p className="pt-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {t("Statusi", "Status")}
              </p>
              <div className="flex max-h-[min(50vh,16rem)] flex-col gap-2 overflow-y-auto overscroll-y-contain">
                {ORDER_STATUSES.map((s) => (
                  <Button
                    key={s}
                    type="button"
                    variant={s === currentStatus ? "default" : "outline"}
                    size="sm"
                    className="h-auto w-full justify-start font-normal"
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
    </>
  );
}
