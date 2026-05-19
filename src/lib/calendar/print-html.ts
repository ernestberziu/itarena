import { format, parseISO } from "date-fns";
import { enUS, sq } from "date-fns/locale";
import { parseCalendarDate } from "./dates";
import type { CalendarPrintPayload } from "./types";

type PrintLabels = {
  title: string;
  noReport: string;
  adminFeedback: string;
  dayHeader: string;
};

function dateLabel(dateStr: string, locale: string) {
  const loc = locale === "en" ? enUS : sq;
  return format(parseCalendarDate(dateStr), "d MMM yyyy (EEE)", { locale: loc });
}

function monthLabel(year: number, month: number, locale: string) {
  const loc = locale === "en" ? enUS : sq;
  return format(parseISO(`${year}-${String(month).padStart(2, "0")}-01`), "MMMM yyyy", {
    locale: loc,
  });
}

export function buildCalendarPrintHtml(
  payload: CalendarPrintPayload,
  locale: string,
  labels: PrintLabels
): string {
  const period = monthLabel(payload.year, payload.month, locale);

  const staffSections = payload.staff
    .map((member) => {
      const name = `${member.firstName} ${member.lastName}`.trim();
      const dayBlocks = member.days
        .filter((d) => d.report)
        .map((d) => {
          const replies = (d.report?.replies ?? [])
            .map(
              (r) =>
                `<div class="reply"><strong>${escapeHtml(`${r.author.firstName} ${r.author.lastName}`)}</strong><p>${escapeHtml(r.body)}</p></div>`
            )
            .join("");
          return `
            <div class="day-block">
              <h4>${escapeHtml(dateLabel(d.date, locale))}</h4>
              <div class="report-body">${escapeHtml(d.report!.body)}</div>
              ${replies ? `<div class="replies"><p class="replies-label">${escapeHtml(labels.adminFeedback)}</p>${replies}</div>` : ""}
            </div>`;
        })
        .join("");

      const emptyDays = member.days.filter((d) => !d.report).length;
      const summary =
        dayBlocks ||
        `<p class="empty">${escapeHtml(labels.noReport)}</p>`;

      return `
        <section class="staff-section">
          <h2>${escapeHtml(name)} <span class="role">${escapeHtml(member.role)}</span></h2>
          <p class="meta">${member.days.filter((d) => d.report).length} / ${member.days.length} ${escapeHtml(labels.dayHeader)}</p>
          ${dayBlocks || summary}
          ${emptyDays > 0 && dayBlocks ? `<p class="missing-note">${emptyDays} ${escapeHtml(labels.dayHeader)} ${escapeHtml(labels.noReport).toLowerCase()}</p>` : ""}
        </section>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(labels.title)} — ${escapeHtml(period)}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; color: #0f172a; margin: 0; padding: 24px; line-height: 1.5; font-size: 13px; }
    h1 { font-size: 20px; margin: 0 0 4px; }
    .subtitle { color: #64748b; margin: 0 0 24px; font-size: 14px; }
    .staff-section { break-inside: avoid; margin-bottom: 28px; padding-bottom: 20px; border-bottom: 1px solid #e2e8f0; }
    .staff-section h2 { font-size: 16px; margin: 0 0 4px; }
    .role { font-size: 11px; font-weight: 600; color: #64748b; background: #f1f5f9; padding: 2px 8px; border-radius: 999px; margin-left: 6px; }
    .meta { color: #64748b; font-size: 12px; margin: 0 0 12px; }
    .day-block { margin-bottom: 14px; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; background: #fafafa; }
    .day-block h4 { margin: 0 0 8px; font-size: 12px; color: #475569; text-transform: capitalize; }
    .report-body { white-space: pre-wrap; }
    .replies { margin-top: 10px; padding-top: 10px; border-top: 1px dashed #cbd5e1; }
    .replies-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin: 0 0 6px; }
    .reply { margin-bottom: 8px; font-size: 12px; }
    .reply p { margin: 4px 0 0; white-space: pre-wrap; }
    .empty, .missing-note { color: #94a3b8; font-style: italic; }
    @media print {
      body { padding: 12px; }
      .staff-section { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <h1>${escapeHtml(labels.title)}</h1>
  <p class="subtitle">${escapeHtml(period)}</p>
  ${staffSections}
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function printCalendarHtml(html: string): boolean {
  if (typeof document === "undefined") return false;

  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText =
    "position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;pointer-events:none";
  document.body.appendChild(iframe);

  const win = iframe.contentWindow;
  if (!win) {
    iframe.remove();
    return false;
  }

  win.document.open();
  win.document.write(html);
  win.document.close();

  const cleanup = () => {
    window.setTimeout(() => iframe.remove(), 1000);
  };

  const triggerPrint = () => {
    try {
      win.focus();
      win.print();
    } catch {
      iframe.remove();
      return;
    }
    cleanup();
  };

  if (win.document.readyState === "complete") {
    window.setTimeout(triggerPrint, 150);
  } else {
    iframe.onload = () => window.setTimeout(triggerPrint, 150);
  }

  return true;
}
