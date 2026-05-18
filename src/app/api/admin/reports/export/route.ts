import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import { buildClientsCsv } from "@/lib/csv-download";
import { resolveReportRange } from "@/lib/reports/date-range";
import { fetchReportsOverview } from "@/lib/reports/fetch-overview";
import { sectionToLabeledRows } from "@/lib/reports/export-data";
import type { ReportLocale } from "@/lib/reports/labels";
import { buildXlsxBuffer } from "@/lib/reports/export-xlsx";
import { buildPdfBuffer } from "@/lib/reports/export-pdf";
import type { ReportSectionId } from "@/lib/reports/types";
import { format } from "date-fns";

const bodySchema = z.object({
  section: z.enum(["revenue", "users", "quotes", "products", "funnel", "support", "overview"]),
  format: z.enum(["csv", "xlsx", "pdf"]),
  preset: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  tz: z.string().optional(),
  locale: z.enum(["sq", "en"]).optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const denied = await assertAdminApiAcl(session.user.id, "reports", "read");
  if (denied) return denied;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const locale: ReportLocale = parsed.data.locale === "en" ? "en" : "sq";
  const range = resolveReportRange({
    preset: parsed.data.preset,
    from: parsed.data.from,
    to: parsed.data.to,
    tz: parsed.data.tz,
  });
  const data = await fetchReportsOverview(range);
  const section = parsed.data.section as ReportSectionId;
  const { columns, rows } = sectionToLabeledRows(section, data, locale);
  const rangeLabel = `${format(new Date(range.from), "PP")} — ${format(new Date(range.to), "PP")}`;
  const baseName = `itarena-report-${parsed.data.section}-${format(new Date(), "yyyy-MM-dd")}`;

  if (parsed.data.format === "csv") {
    const csv = buildClientsCsv(rows, columns);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${baseName}.csv"`,
      },
    });
  }

  if (parsed.data.format === "xlsx") {
    const buf = await buildXlsxBuffer(parsed.data.section, columns, rows);
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${baseName}.xlsx"`,
      },
    });
  }

  const tableRows = rows.map((r) => columns.map((c) => r[c.key] ?? ""));
  const buf = await buildPdfBuffer(
    section,
    rangeLabel,
    data,
    locale,
    columns.map((c) => c.header),
    tableRows
  );
  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${baseName}.pdf"`,
    },
  });
}
