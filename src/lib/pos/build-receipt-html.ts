import { format } from "date-fns";
import type { TemplateSettingsConfig } from "@/lib/templates/types";
import type { OrderLineItem } from "@/lib/order-fulfillment";
import { posCashClientDisplayName } from "./cash-client";

export type PosReceiptInput = {
  orderNumber: string;
  createdAt: Date;
  items: OrderLineItem[];
  subtotal: number;
  total: number;
  paymentMethod: string;
  cashierName: string;
  customerLabel: string;
  isCashClient: boolean;
  settings: TemplateSettingsConfig;
  locale: string;
  autoprint?: boolean;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatReceiptPrice(amount: number): string {
  const formatted = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${formatted} Lek`;
}

const LOGO_SVG = `<svg width="28" height="32" viewBox="0 0 30 36" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <circle cx="7" cy="4" r="3.9" fill="#2D2D38"/>
  <circle cx="15" cy="4" r="3.9" fill="#1400D4"/>
  <circle cx="23" cy="4" r="3.9" fill="#2D2D38"/>
  <rect x="11.4" y="10" width="7.2" height="15.6" rx="3.6" fill="#1400D4"/>
</svg>`;

export function buildPosReceiptHtml(input: PosReceiptInput): string {
  const en = input.locale === "en";
  const labels = {
    receipt: en ? "RECEIPT" : "FATURË",
    order: en ? "Order" : "Porosi",
    date: en ? "Date" : "Data",
    cashier: en ? "Cashier" : "Arkëtari",
    customer: en ? "Customer" : "Klienti",
    payment: en ? "Payment" : "Pagesa",
    subtotal: en ? "Subtotal" : "Nëntotali",
    total: en ? "TOTAL" : "TOTALI",
    thanks: en ? "Thank you!" : "Faleminderit!",
    cash: en ? "Cash" : "Para në dorë",
  };

  const lines = input.items
    .map((item) => {
      const lineTotal = item.price * item.quantity;
      return `<tr>
        <td class="name">${escapeHtml(item.name)}</td>
        <td class="qty">${item.quantity}</td>
        <td class="amt">${formatReceiptPrice(lineTotal)}</td>
      </tr>
      <tr class="sub"><td colspan="3">${escapeHtml(item.sku ?? "")} × ${formatReceiptPrice(item.price)}</td></tr>`;
    })
    .join("");

  const paymentLabel =
    input.paymentMethod === "CASH" ? labels.cash : input.paymentMethod;
  const customer =
    input.isCashClient ? posCashClientDisplayName(input.locale) : input.customerLabel;

  const autoprintScript = input.autoprint
    ? `<script>window.onload=function(){setTimeout(function(){window.print()},200)};</script>`
    : "";

  return `<!DOCTYPE html>
<html lang="${input.locale}">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(input.orderNumber)}</title>
  <style>
    @page { size: 80mm auto; margin: 3mm; }
    * { box-sizing: border-box; }
    body {
      font-family: ui-monospace, "Courier New", monospace;
      font-size: 11px;
      line-height: 1.35;
      color: #0f172a;
      margin: 0;
      padding: 8px 6px 12px;
      max-width: 72mm;
    }
    .head { text-align: center; border-bottom: 1px dashed #cbd5e1; padding-bottom: 8px; margin-bottom: 8px; }
    .logo-row { display: flex; align-items: center; justify-content: center; gap: 6px; }
    .brand { font-size: 18px; font-weight: 700; color: #1400D4; letter-spacing: -0.5px; }
    .legal { font-size: 9px; color: #64748b; margin-top: 4px; }
    h1 { font-size: 13px; margin: 6px 0 0; letter-spacing: 0.05em; }
    .meta { font-size: 10px; margin: 2px 0; }
    table.items { width: 100%; border-collapse: collapse; margin: 8px 0; }
    table.items td { vertical-align: top; padding: 2px 0; }
    table.items .name { width: 55%; }
    table.items .qty { width: 15%; text-align: center; }
    table.items .amt { width: 30%; text-align: right; font-weight: 600; }
    tr.sub td { font-size: 9px; color: #64748b; padding-bottom: 4px; border-bottom: 1px dotted #e2e8f0; }
    .totals { border-top: 1px dashed #cbd5e1; padding-top: 6px; margin-top: 4px; }
    .totals .row { display: flex; justify-content: space-between; margin: 2px 0; }
    .totals .grand { font-size: 14px; font-weight: 700; margin-top: 4px; }
    .foot { text-align: center; margin-top: 10px; font-size: 10px; color: #64748b; }
    .strip { height: 3px; background: #1400D4; margin-bottom: 8px; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="strip"></div>
  <div class="head">
    <div class="logo-row">${LOGO_SVG}<span class="brand">IT arena</span></div>
    <div class="legal">${escapeHtml(input.settings.companyLegalName)}</div>
    <div class="legal">${escapeHtml(input.settings.companyAddress)}</div>
    ${input.settings.companyNuis ? `<div class="legal">${en ? "VAT" : "NIPT"}: ${escapeHtml(input.settings.companyNuis)}</div>` : ""}
    <h1>${labels.receipt}</h1>
  </div>
  <p class="meta"><strong>${labels.order}:</strong> ${escapeHtml(input.orderNumber)}</p>
  <p class="meta"><strong>${labels.date}:</strong> ${format(input.createdAt, "dd/MM/yyyy HH:mm")}</p>
  <p class="meta"><strong>${labels.cashier}:</strong> ${escapeHtml(input.cashierName)}</p>
  <p class="meta"><strong>${labels.customer}:</strong> ${escapeHtml(customer)}</p>
  <p class="meta"><strong>${labels.payment}:</strong> ${escapeHtml(paymentLabel)}</p>
  <table class="items">
    <tbody>${lines}</tbody>
  </table>
  <div class="totals">
    <div class="row"><span>${labels.subtotal}</span><span>${formatReceiptPrice(input.subtotal)}</span></div>
    <div class="row grand"><span>${labels.total}</span><span>${formatReceiptPrice(input.total)}</span></div>
  </div>
  <p class="foot">${labels.thanks}</p>
  ${autoprintScript}
</body>
</html>`;
}
