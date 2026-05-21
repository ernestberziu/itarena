import { format, parseISO } from "date-fns";
import { enUS, sq } from "date-fns/locale";
import type { PosDailySalesPayload, PosDailySalesStaffRow } from "./types";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatMoney(amount: number): string {
  return (
    Math.round(amount)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " Lekë"
  );
}

function formatTime(iso: string): string {
  try {
    return format(parseISO(iso), "HH:mm");
  } catch {
    return "";
  }
}

function staffSection(
  row: PosDailySalesStaffRow,
  labels: Record<string, string>,
  cashLabel: string
): string {
  const name = escapeHtml(`${row.firstName} ${row.lastName}`.trim());
  const salesHtml = row.sales
    .map((sale) => {
      const customer = escapeHtml(sale.isCashClient ? cashLabel : sale.customerName);
      const items = sale.items
        .map(
          (item) => `<tr>
            <td>${escapeHtml(item.name)}${item.sku ? `<span class="sku">${escapeHtml(item.sku)}</span>` : ""}</td>
            <td class="num">${item.quantity}</td>
            <td class="num">${escapeHtml(formatMoney(item.price))}</td>
            <td class="num">${escapeHtml(formatMoney(item.lineTotal))}</td>
          </tr>`
        )
        .join("");

      return `
        <div class="sale">
          <div class="sale-head">
            <span class="mono">${escapeHtml(sale.orderNumber)}</span>
            <span>${formatTime(sale.createdAt)}</span>
            <span>${customer}</span>
            <span class="sale-total">${escapeHtml(formatMoney(sale.orderTotal))}</span>
          </div>
          <table class="items">
            <thead><tr>
              <th>${escapeHtml(labels.product)}</th>
              <th class="num">${escapeHtml(labels.qty)}</th>
              <th class="num">${escapeHtml(labels.unit)}</th>
              <th class="num">${escapeHtml(labels.line)}</th>
            </tr></thead>
            <tbody>${items}</tbody>
          </table>
        </div>`;
    })
    .join("");

  return `
    <section class="staff-block">
      <h2>${name} <span class="role">${escapeHtml(row.role)}</span></h2>
      <p class="staff-meta">${row.saleCount} ${escapeHtml(labels.sales).toLowerCase()} · ${escapeHtml(formatMoney(row.total))}</p>
      ${salesHtml}
    </section>`;
}

export function buildPosDailySalesPrintHtml(
  payload: PosDailySalesPayload,
  locale: string
): string {
  const en = locale === "en";
  const loc = en ? enUS : sq;
  const period = format(parseISO(payload.date), "d MMMM yyyy", { locale: loc });
  const cashLabel = en ? "Cash client" : "Klient me para në dorë";
  const labels = {
    title: en ? "Daily POS sales — detailed" : "Shitjet ditore POS — të detajuara",
    staff: en ? "Staff" : "Stafi",
    role: en ? "Role" : "Roli",
    sales: en ? "Sales" : "Shitje",
    total: en ? "Total" : "Totali",
    grand: en ? "Grand total" : "Totali i përgjithshëm",
    none: en ? "No POS sales on this date." : "Nuk ka shitje POS për këtë datë.",
    product: en ? "Product" : "Produkti",
    qty: en ? "Qty" : "Sasía",
    unit: en ? "Unit" : "Çmimi",
    line: en ? "Line" : "Rreshti",
  };

  const summaryRows =
    payload.staff.length === 0
      ? ""
      : `<table class="summary">
    <thead><tr>
      <th>${escapeHtml(labels.staff)}</th>
      <th>${escapeHtml(labels.role)}</th>
      <th class="num">${escapeHtml(labels.sales)}</th>
      <th class="num">${escapeHtml(labels.total)}</th>
    </tr></thead>
    <tbody>${payload.staff
      .map(
        (s) => `<tr>
      <td>${escapeHtml(`${s.firstName} ${s.lastName}`.trim())}</td>
      <td>${escapeHtml(s.role)}</td>
      <td class="num">${s.saleCount}</td>
      <td class="num">${escapeHtml(formatMoney(s.total))}</td>
    </tr>`
      )
      .join("")}</tbody>
  </table>`;

  const detailSections =
    payload.staff.length === 0
      ? `<p class="empty">${escapeHtml(labels.none)}</p>`
      : payload.staff.map((s) => staffSection(s, labels, cashLabel)).join("");

  return `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(labels.title)} — ${escapeHtml(period)}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; font-size: 12px; color: #0f172a; margin: 20px; line-height: 1.4; }
    h1 { font-size: 18px; margin: 0 0 4px; color: #1400D4; }
    .sub { color: #64748b; margin: 0 0 16px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border-bottom: 1px solid #e2e8f0; padding: 6px 8px; text-align: left; vertical-align: top; }
    th { font-size: 10px; text-transform: uppercase; color: #64748b; }
    td.num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
    .summary { margin-bottom: 24px; }
    .grand { margin: 12px 0 24px; font-weight: 700; font-size: 14px; }
    .staff-block { break-inside: avoid; margin-bottom: 22px; padding-bottom: 16px; border-bottom: 2px solid #e2e8f0; }
    .staff-block h2 { font-size: 14px; margin: 0 0 4px; }
    .staff-block .role { font-size: 11px; font-weight: 600; color: #64748b; }
    .staff-meta { margin: 0 0 10px; font-size: 11px; color: #64748b; }
    .sale { margin-bottom: 12px; padding: 8px; background: #f8fafc; border-radius: 6px; }
    .sale-head { display: flex; flex-wrap: wrap; gap: 8px 12px; font-size: 11px; margin-bottom: 6px; align-items: baseline; }
    .sale-head .mono { font-family: ui-monospace, monospace; font-weight: 600; }
    .sale-total { margin-left: auto; font-weight: 700; }
    table.items { font-size: 11px; }
    table.items td .sku { display: block; font-size: 10px; color: #64748b; font-family: ui-monospace, monospace; }
    .empty { text-align: center; color: #64748b; padding: 24px; }
    @media print { body { margin: 10px; } .staff-block { page-break-inside: avoid; } }
  </style>
</head>
<body>
  <h1>${escapeHtml(labels.title)}</h1>
  <p class="sub">${escapeHtml(period)}</p>
  ${summaryRows}
  <p class="grand">${escapeHtml(labels.grand)}: ${payload.grandCount} ${escapeHtml(labels.sales).toLowerCase()} — ${escapeHtml(formatMoney(payload.grandTotal))}</p>
  ${detailSections}
</body>
</html>`;
}
