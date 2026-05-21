"use client";
import { useUiT } from "@/hooks/use-ui-t";

import { useState, type ReactElement } from "react";
import { Plus, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AdminPosSaleSheet } from "@/components/admin/admin-pos-sale-sheet";
import { AdminPosDailySalesSheet } from "@/components/admin/admin-pos-daily-sales-sheet";

const fabSurface =
  "border border-border/70 bg-white text-slate-900 shadow-lg hover:bg-slate-50 dark:border-border/60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100";

function FabTooltip({
  label,
  render,
}: {
  label: string;
  render: ReactElement;
}) {
  return (
    <Tooltip>
      <TooltipTrigger render={render} />
      <TooltipContent side="left" sideOffset={10} className="text-xs font-medium">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

export function AdminPosFab({
  canPosSale,
  showDailyReport,
  locale,
}: {
  canPosSale: boolean;
  showDailyReport: boolean;
  locale: string;
}) {
  const en = locale === "en";
  const tUi = useUiT();
  const [menuOpen, setMenuOpen] = useState(false);
  const [saleOpen, setSaleOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const onlyReport = showDailyReport && !canPosSale;
  const both = canPosSale && showDailyReport;

  function openSale() {
    setMenuOpen(false);
    setSaleOpen(true);
  }

  function openReport() {
    setMenuOpen(false);
    setReportOpen(true);
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 hidden flex-col items-end gap-2.5 lg:flex">
        {both && menuOpen ? (
          <>
            <FabTooltip
              label={tUi("daily_sales")}
              render={
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className={cn("h-10 gap-2 rounded-full px-4", fabSurface)}
                  onClick={openReport}
                >
                  <BarChart3 className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                  <span className="font-medium">{tUi("daily_sales")}</span>
                </Button>
              }
            />
            <FabTooltip
              label={tUi("new_sale")}
              render={
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className={cn("h-10 gap-2 rounded-full px-4", fabSurface)}
                  onClick={openSale}
                >
                  <Plus className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                  <span className="font-medium">{tUi("new_sale")}</span>
                </Button>
              }
            />
          </>
        ) : null}

        {onlyReport ? (
          <FabTooltip
            label={tUi("daily_pos_sales")}
            render={
              <Button
                type="button"
                size="icon"
                variant="outline"
                className={cn("h-14 w-14 rounded-full", fabSurface)}
                onClick={openReport}
              >
                <BarChart3 className="h-6 w-6" strokeWidth={2} aria-hidden />
              </Button>
            }
          />
        ) : (
          <FabTooltip
            label={
              both
                ? menuOpen
                  ? tUi("close_menu")
                  : tUi("pos_menu")
                : tUi("new_sale")
            }
            render={
              <Button
                type="button"
                size="icon"
                variant="outline"
                className={cn(
                  "h-14 w-14 rounded-full transition-transform",
                  fabSurface,
                  both && menuOpen && "rotate-45"
                )}
                onClick={() => {
                  if (both) setMenuOpen((o) => !o);
                  else openSale();
                }}
              >
                <Plus className="h-6 w-6" strokeWidth={2} aria-hidden />
              </Button>
            }
          />
        )}
      </div>

      {canPosSale ? (
        <AdminPosSaleSheet open={saleOpen} onOpenChange={setSaleOpen} locale={locale} />
      ) : null}
      {showDailyReport ? (
        <AdminPosDailySalesSheet
          open={reportOpen}
          onOpenChange={setReportOpen}
          locale={locale}
        />
      ) : null}
    </>
  );
}
