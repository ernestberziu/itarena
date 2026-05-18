import type { LineItem, RecurringFrequency, ServiceContractPayload, TemplateLanguage } from "./types";
import { formatMoney, lineItemTotal } from "./calculate";
import { defaultServiceLocalized } from "./localized";

export const RECURRING_FREQUENCIES: RecurringFrequency[] = [
  "WEEKLY",
  "BIWEEKLY",
  "MONTHLY",
  "QUARTERLY",
  "SEMIANNUAL",
  "YEARLY",
];

const FREQUENCY_LABELS: Record<RecurringFrequency, { en: string; sq: string }> = {
  WEEKLY:     { en: "Weekly",        sq: "Javore" },
  BIWEEKLY:   { en: "Every 2 weeks", sq: "Çdo 2 javë" },
  MONTHLY:    { en: "Monthly",       sq: "Mujore" },
  QUARTERLY:  { en: "Every 3 months",sq: "Çdo 3 muaj" },
  SEMIANNUAL: { en: "Every 6 months",sq: "Çdo 6 muaj" },
  YEARLY:     { en: "Yearly",        sq: "Vjetore" },
};

export function recurringFrequencyLabel(
  frequency: RecurringFrequency,
  language: TemplateLanguage
): string {
  return FREQUENCY_LABELS[frequency][language === "en" ? "en" : "sq"];
}

export function normalizeServicePayload(
  payload: ServiceContractPayload
): ServiceContractPayload {
  const localized = payload.localized ?? {
    sq: defaultServiceLocalized("sq"),
    en: defaultServiceLocalized("en"),
  };
  return {
    ...payload,
    localized,
    recurringEnabled: payload.recurringEnabled ?? false,
    recurringFrequency: payload.recurringFrequency ?? "MONTHLY",
    recurringServices: payload.recurringServices ?? [],
    recurringAmount: payload.recurringAmount,
    recurringStartDate: payload.recurringStartDate,
  };
}

export function recurringServicesTotal(payload: ServiceContractPayload): number {
  const items = payload.recurringServices ?? [];
  return items.reduce((sum, item) => sum + lineItemTotal(item), 0);
}

export function effectiveRecurringAmount(
  payload: ServiceContractPayload,
  contractTotal: number
): number {
  const fromServices = recurringServicesTotal(payload);
  if (fromServices > 0) return fromServices;
  return payload.recurringAmount ?? contractTotal;
}

/**
 * Formats recurring services as a markdown table grouped by frequency.
 * Each item shows name, description, qty, unit price, frequency, and line total.
 */
export function formatRecurringSchedule(
  payload: ServiceContractPayload,
  language: TemplateLanguage,
  contractTotal: number
): string | null {
  if (!payload.recurringEnabled) return null;

  const loc = language === "en" ? "en" : "sq";
  const en = language === "en";
  const start = payload.recurringStartDate ?? payload.startDate;
  const defaultFreq = payload.recurringFrequency ?? "MONTHLY";
  const vatOn = payload.recurringVatEnabled ?? false;
  const services = (payload.recurringServices ?? []).filter((s) => s.name.trim());

  const startLine = en
    ? `Starting from **${start}**.`
    : `Duke filluar nga **${start}**.`;

  if (services.length === 0) {
    const amount = effectiveRecurringAmount(payload, contractTotal);
    const freq = recurringFrequencyLabel(defaultFreq, language);
    return en
      ? `Recurring payment of **${formatMoney(amount, payload.currency, loc)}**, billed ${freq.toLowerCase()}, starting **${start}**.`
      : `Pagesë e përsëritur **${formatMoney(amount, payload.currency, loc)}**, me frekuencë ${freq.toLowerCase()}, duke filluar nga **${start}**.`;
  }

  const hName = en ? "Name" : "Emri";
  const hDesc = en ? "Description" : "Përshkrimi";
  const hQty = en ? "Qty" : "Sasia";
  const hUnit = en ? "Unit Price" : "Çmimi/njësia";
  const hVat = en ? "VAT %" : "TVSH %";
  const hAmt = en ? "Amount" : "Vlera";
  const totalLabel = en ? "**Total**" : "**Totali**";
  const subtotalLabel = en ? "**Subtotal**" : "**Nëntotali**";
  const vatLabel = en ? "**VAT**" : "**TVSH**";
  const recurringIntro = en
    ? "Recurring services and billing:"
    : "Shërbimet dhe faturimi i përsëritur:";

  const hasDesc = services.some((s) => s.description?.trim());

  const header = hasDesc && vatOn
    ? `| ${hName} | ${hDesc} | ${hQty} | ${hUnit} | ${hVat} | ${hAmt} |`
    : hasDesc
      ? `| ${hName} | ${hDesc} | ${hQty} | ${hUnit} | ${hAmt} |`
      : vatOn
        ? `| ${hName} | ${hQty} | ${hUnit} | ${hVat} | ${hAmt} |`
        : `| ${hName} | ${hQty} | ${hUnit} | ${hAmt} |`;

  const sep = hasDesc && vatOn
    ? `|:---|:---|---:|---:|---:|---:|`
    : hasDesc
      ? `|:---|:---|---:|---:|---:|`
      : vatOn
        ? `|:---|---:|---:|---:|---:|`
        : `|:---|---:|---:|---:|`;

  const itemTotal = (item: LineItem) =>
    vatOn ? lineItemTotal(item) : item.quantity * item.unitPrice;

  const rows = services.map((item) => {
    const freq = recurringFrequencyLabel(item.frequency ?? defaultFreq, language);
    const nameCell = `${item.name} (${freq})`;
    const desc = item.description?.trim() ?? "";
    const unitFmt = formatMoney(item.unitPrice, payload.currency, loc);
    const totalFmt = formatMoney(itemTotal(item), payload.currency, loc);

    if (hasDesc && vatOn) {
      return `| ${nameCell} | ${desc || "—"} | ${item.quantity} | ${unitFmt} | ${item.vatPercent}% | ${totalFmt} |`;
    }
    if (hasDesc) {
      return `| ${nameCell} | ${desc || "—"} | ${item.quantity} | ${unitFmt} | ${totalFmt} |`;
    }
    if (vatOn) {
      return `| ${nameCell} | ${item.quantity} | ${unitFmt} | ${item.vatPercent}% | ${totalFmt} |`;
    }
    return `| ${nameCell} | ${item.quantity} | ${unitFmt} | ${totalFmt} |`;
  });

  const subtotal = services.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const vatAmount = vatOn
    ? services.reduce((s, i) => s + i.quantity * i.unitPrice * (i.vatPercent / 100), 0)
    : 0;
  const grandTotal = subtotal + vatAmount;
  const subFmt = formatMoney(subtotal, payload.currency, loc);
  const vatFmt = formatMoney(vatAmount, payload.currency, loc);
  const grandFmt = formatMoney(grandTotal, payload.currency, loc);

  const totalRows: string[] = [];
  if (hasDesc && vatOn) {
    if (vatAmount > 0) {
      totalRows.push(`| ${subtotalLabel} | | | | | **${subFmt}** |`);
      totalRows.push(`| ${vatLabel} | | | | | **${vatFmt}** |`);
    }
    totalRows.push(`| ${totalLabel} | | | | | **${grandFmt}** |`);
  } else if (hasDesc) {
    totalRows.push(`| ${totalLabel} | | | | **${grandFmt}** |`);
  } else if (vatOn) {
    if (vatAmount > 0) {
      totalRows.push(`| ${subtotalLabel} | | | | **${subFmt}** |`);
      totalRows.push(`| ${vatLabel} | | | | **${vatFmt}** |`);
    }
    totalRows.push(`| ${totalLabel} | | | | **${grandFmt}** |`);
  } else {
    totalRows.push(`| ${totalLabel} | | | **${grandFmt}** |`);
  }

  const table = [header, sep, ...rows, ...totalRows].join("\n");
  return `${recurringIntro}\n\n${table}\n\n${startLine}`;
}
