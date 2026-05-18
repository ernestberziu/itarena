"use client";

import { Download, FileSpreadsheet, FileText, Printer } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ReportSectionId } from "@/lib/reports/types";

export function ReportsExportMenu({
  section,
  locale,
  rangeParams,
}: {
  section: ReportSectionId;
  locale: string;
  rangeParams: Record<string, string>;
}) {
  const t = useTranslations("admin.reportsPage");

  async function exportAs(format: "csv" | "xlsx" | "pdf") {
    try {
      const res = await fetch("/api/admin/reports/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section,
          format,
          locale: locale === "en" ? "en" : "sq",
          ...rangeParams,
        }),
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const ext = format === "xlsx" ? "xlsx" : format === "pdf" ? "pdf" : "csv";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `itarena-${section}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(t("exportDownloaded"));
    } catch {
      toast.error(t("exportFailed"));
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" />}
      >
        <Download className="h-3.5 w-3.5" />
        {t("export")}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => void exportAs("csv")}>
          <FileText className="mr-2 h-4 w-4" />
          CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => void exportAs("xlsx")}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => void exportAs("pdf")}>
          <FileText className="mr-2 h-4 w-4" />
          PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" />
          {t("print")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
