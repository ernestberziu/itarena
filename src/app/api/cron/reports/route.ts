import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { db } from "@/lib/db";
import { resolveReportRange } from "@/lib/reports/date-range";
import { fetchReportsOverview } from "@/lib/reports/fetch-overview";
import { buildClientsCsv } from "@/lib/csv-download";
import { sectionToRows } from "@/lib/reports/export-data";
import type { ReportPresetConfig } from "@/lib/reports/metric-registry";
import { DEFAULT_PRESET_CONFIG } from "@/lib/reports/metric-registry";

/** Vercel cron: GET with Authorization: Bearer $CRON_SECRET */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const schedules = await db.reportSchedule.findMany({
    where: { enabled: true },
    include: { preset: true },
  });

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) {
    return NextResponse.json({ error: "SMTP not configured", processed: 0 }, { status: 503 });
  }

  const transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  });

  let sent = 0;
  for (const sched of schedules) {
    const recipients = JSON.parse(sched.recipients) as string[];
    if (!Array.isArray(recipients) || recipients.length === 0) continue;

    const config = (sched.preset?.configJson ?? DEFAULT_PRESET_CONFIG) as ReportPresetConfig;
    const range = resolveReportRange({ preset: config.defaultRange ?? "last30", tz: null });
    const data = await fetchReportsOverview(range, true);
    const section = config.sections[0] ?? "overview";
    const { columns, rows } = sectionToRows(section as "overview", data);
    const csv = buildClientsCsv(rows, columns);

    for (const to of recipients) {
      await transporter.sendMail({
        from: process.env.SMTP_FROM ?? user,
        to,
        subject: `ITArena report: ${sched.preset?.name ?? "Scheduled"}`,
        text: "Attached CSV export from scheduled ITArena admin report.",
        attachments: [{ filename: `report-${section}.csv`, content: csv }],
      });
    }

    await db.reportSchedule.update({
      where: { id: sched.id },
      data: { lastRunAt: new Date() },
    });
    sent += 1;
  }

  return NextResponse.json({ ok: true, processed: sent });
}
