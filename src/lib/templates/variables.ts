import type { ContractParty, EmploymentPayload, PartnerPayload, ServiceContractPayload, TemplateLanguage, TemplateSettingsConfig } from "./types";
import { computeContractTotals, formatMoney, lineItemTotal } from "./calculate";
import { formatRecurringSchedule } from "./recurring";
import { resolveServiceForLanguage, resolveEmploymentForLanguage, resolvePartnerForLanguage, getServiceLocalized } from "./localized";
import { resolvePartyCompanyName, resolvePartyTaxId, resolvePartyTaxIdLabel } from "./party";

export type VariableContext = {
  language: TemplateLanguage;
  party: ContractParty;
  settings: TemplateSettingsConfig;
  documentNumber?: string;
  service?: ServiceContractPayload;
  employment?: EmploymentPayload;
  partner?: PartnerPayload;
};

export function buildVariableMap(ctx: VariableContext): Record<string, string> {
  const locale = ctx.language === "en" ? "en" : "sq";
  const vars: Record<string, string> = {
    customer_name: ctx.party.fullName.trim() || "—",
    company_name: resolvePartyCompanyName(ctx.party),
    customer_nipt: resolvePartyTaxId(ctx.party),
    customer_tax_id_label: resolvePartyTaxIdLabel(ctx.party),
    customer_nuis: resolvePartyTaxId(ctx.party), // legacy alias
    customer_address: ctx.party.address ?? "—",
    customer_phone: ctx.party.phone ?? "—",
    customer_email: ctx.party.email ?? "—",
    contract_date: ctx.service?.contractDate ?? ctx.partner?.contractDate ?? ctx.employment?.startDate ?? new Date().toISOString().slice(0, 10),
    contract_start: ctx.service?.startDate ?? ctx.partner?.startDate ?? ctx.employment?.startDate ?? "—",
    contract_end: ctx.service?.endDate ?? ctx.partner?.endDate ?? ctx.employment?.endDate ?? "—",
    payment_terms: ctx.service?.paymentTerms ?? "—",
    delivery_terms: ctx.service?.deliveryTerms ?? "—",
    recurring_schedule: "—",
    document_number: ctx.documentNumber ?? "DRAFT",
    itarena_representative: ctx.settings.authorizedRepresentative,
    itarena_title: ctx.settings.representativeTitle,
    itarena_company: ctx.settings.companyLegalName,
    itarena_nipt: ctx.settings.companyNuis,
    itarena_nuis: ctx.settings.companyNuis, // legacy alias
    itarena_address: ctx.settings.companyAddress,
  };

  if (ctx.service) {
    const service = resolveServiceForLanguage(ctx.service, ctx.language);
    const serviceLocalized = getServiceLocalized(ctx.service, ctx.language);
    vars.payment_terms = service.paymentTerms;
    vars.delivery_terms = service.deliveryTerms;
    const noticePeriod = serviceLocalized.noticePeriod ?? "—";
    vars.notice_period = noticePeriod;

    const totals = computeContractTotals(
      ctx.service.services,
      ctx.service.products,
      ctx.service.vatEnabled
    );
    vars.total_price = formatMoney(totals.total, ctx.service.currency, locale);
    vars.subtotal = formatMoney(totals.subtotal, ctx.service.currency, locale);
    vars.vat_amount = formatMoney(totals.vatAmount, ctx.service.currency, locale);
    vars.currency = ctx.service.currency;

    // ── pricing_detail: VAT-conditional summary sentence ──────────────────────
    const en = ctx.language === "en";
    if (ctx.service.vatEnabled && totals.vatAmount > 0) {
      vars.pricing_detail = en
        ? `The total contract value is **${vars.total_price}** (inclusive of VAT). Pre-tax subtotal: ${vars.subtotal}. VAT applied: ${vars.vat_amount}.`
        : `Vlera totale e kontratës është **${vars.total_price}** (përfshirë TVSH-në). Nëntotali pa TVSH: ${vars.subtotal}. TVSH e aplikuar: ${vars.vat_amount}.`;
    } else {
      vars.pricing_detail = en
        ? `The total contract value is **${vars.total_price}**.`
        : `Vlera totale e kontratës është **${vars.total_price}**.`;
    }

    // ── pricing_table: markdown table of all line items ───────────────────────
    const allItems = [...ctx.service.services, ...ctx.service.products];
    const showPrices = ctx.service.showPrices !== false;
    if (allItems.length === 0) {
      vars.pricing_table = "";
    } else if (showPrices) {
      const hName = en ? "Name" : "Emri";
      const hDesc = en ? "Description" : "Përshkrimi";
      const hQty = en ? "Qty" : "Sasia";
      const hUnit = en ? "Unit Price" : "Çmimi/njësia";
      const hVat = en ? "VAT %" : "TVSH %";
      const hAmt = en ? "Amount" : "Vlera";
      const totalLabel = en ? "**Total**" : "**Totali**";
      const subtotalLabel = en ? "**Subtotal**" : "**Nëntotali**";
      const vatLabel = en ? "**VAT**" : "**TVSH**";

      const hasDesc = allItems.some((i) => i.description?.trim());
      const hasItemVat =
        ctx.service.vatEnabled && allItems.some((i) => i.vatPercent > 0);

      const rowVatSum = totals.vatAmount;

      const header =
        hasDesc && hasItemVat
          ? `| ${hName} | ${hDesc} | ${hQty} | ${hUnit} | ${hVat} | ${hAmt} |`
          : hasDesc
            ? `| ${hName} | ${hDesc} | ${hQty} | ${hUnit} | ${hAmt} |`
            : hasItemVat
              ? `| ${hName} | ${hQty} | ${hUnit} | ${hVat} | ${hAmt} |`
              : `| ${hName} | ${hQty} | ${hUnit} | ${hAmt} |`;

      const sep =
        hasDesc && hasItemVat
          ? `|:---|:---|---:|---:|---:|---:|`
          : hasDesc
            ? `|:---|:---|---:|---:|---:|`
            : hasItemVat
              ? `|:---|---:|---:|---:|---:|`
              : `|:---|---:|---:|---:|`;

      const rows = allItems.map((item) => {
        const unitFmt = formatMoney(item.unitPrice, ctx.service!.currency, locale);
        const base = item.quantity * item.unitPrice;
        const amount = hasItemVat ? lineItemTotal(item) : base;
        const totalFmt = formatMoney(amount, ctx.service!.currency, locale);
        const desc = item.description?.trim() ?? "";

        if (hasDesc && hasItemVat) {
          return `| ${item.name} | ${desc || "—"} | ${item.quantity} | ${unitFmt} | ${item.vatPercent}% | ${totalFmt} |`;
        }
        if (hasDesc) {
          return `| ${item.name} | ${desc || "—"} | ${item.quantity} | ${unitFmt} | ${totalFmt} |`;
        }
        if (hasItemVat) {
          return `| ${item.name} | ${item.quantity} | ${unitFmt} | ${item.vatPercent}% | ${totalFmt} |`;
        }
        return `| ${item.name} | ${item.quantity} | ${unitFmt} | ${totalFmt} |`;
      });

      const footerRows: string[] = [];

      if (hasItemVat) {
        const subFmt = formatMoney(totals.subtotal, ctx.service!.currency, locale);
        const itemVatFmt = formatMoney(rowVatSum, ctx.service!.currency, locale);
        if (hasDesc) {
          footerRows.push(`| ${subtotalLabel} | | | | | **${subFmt}** |`);
          if (rowVatSum > 0) {
            footerRows.push(`| ${vatLabel} | | | | | **${itemVatFmt}** |`);
          }
          footerRows.push(`| ${totalLabel} | | | | | **${vars.total_price}** |`);
        } else {
          footerRows.push(`| ${subtotalLabel} | | | | **${subFmt}** |`);
          if (rowVatSum > 0) {
            footerRows.push(`| ${vatLabel} | | | | **${itemVatFmt}** |`);
          }
          footerRows.push(`| ${totalLabel} | | | | **${vars.total_price}** |`);
        }
      } else {
        footerRows.push(
          hasDesc
            ? `| ${totalLabel} | | | | **${vars.total_price}** |`
            : `| ${totalLabel} | | | **${vars.total_price}** |`
        );
      }

      vars.pricing_table =
        `${header}\n${sep}\n` + rows.join("\n") + "\n" + footerRows.join("\n");
    } else {
      const h1 = en ? "Services & Products" : "Shërbime dhe produkte";
      const rows = allItems.map((item) => `| ${item.name} |`);
      vars.pricing_table =
        `| ${h1} |\n` +
        `|:---|\n` +
        rows.join("\n");
    }
    const recurring = formatRecurringSchedule(ctx.service, ctx.language, totals.total);
    vars.recurring_schedule = recurring ?? "";

    // Termination clause: different wording for one-time vs recurring contracts
    const isRecurring = ctx.service.recurringEnabled ?? false;
    if (ctx.language === "en") {
      vars.termination_clause = isRecurring
        ? `Either party may terminate this Agreement upon written notice of not less than **${noticePeriod}**. If the Client breaches payment obligations and the dispute is not resolved within 15 days of notification, the Provider may terminate immediately and claim all outstanding amounts. Upon termination, the Provider delivers materials completed to date and the Client pays for work performed on a pro-rata basis.`
        : `This Agreement is one-time in nature and concludes upon full delivery and payment. If the Client wishes to cancel **before work begins**, written notice of not less than **${noticePeriod}** is required. Cancellation after work has commenced will result in pro-rata charges for the work performed to that point. The Provider retains the right to invoice for all completed deliverables.`;
    } else {
      vars.termination_clause = isRecurring
        ? `Secila palë mund ta zgjidhë këtë Kontratë me njoftim me shkrim jo më pak se **${noticePeriod}** para. Nëse Klienti shkel detyrimet e pagesës dhe mosmarrëveshja nuk zgjidhet brenda 15 ditëve nga njoftimi, Ofruesi ka të drejtë të zgjidhë Kontratën menjëherë dhe të kërkojë të gjitha shumat e papaguara. Pas zgjidhjes, Ofruesi dorëzon materialin e përfunduar deri atë moment, ndërsa Klienti paguan shërbimin e kryer proporcionalisht.`
        : `Kjo Kontratë ka natyrë njëherësh dhe mbaron pas dorëzimit të plotë dhe pagesës. Nëse Klienti dëshiron ta anulojë kontratën **para fillimit të punës**, nevojitet njoftim me shkrim jo më pak se **${noticePeriod}** para. Anulimi pas fillimit të punës do të sjellë pagesa proporcionale për punën e kryer deri atë moment. Ofruesi ruan të drejtën të faturojë të gjitha rezultatet e kompletuara.`;
    }
  }

  if (ctx.employment) {
    const resolved = resolveEmploymentForLanguage(ctx.employment, ctx.language);
    vars.employee_name = `${ctx.employment.firstName} ${ctx.employment.lastName}`.trim();
    vars.employee_position = ctx.employment.position;
    vars.employee_salary = ctx.employment.salary;
    vars.employee_id = ctx.employment.idNumber;
    vars.employee_working_hours = resolved.workingHours;
    vars.employee_contract_type = resolved.contractType;
    vars.notice_period = resolved.noticePeriod ?? "—";
    vars.employer_duties = resolved.employerDuties ?? "—";
    vars.employee_duties = resolved.employeeDuties ?? "—";
    vars.annual_leave = resolved.annualLeave ?? "—";
    const endDate = ctx.employment.endDate;
    vars.contract_end_clause = endDate
      ? (ctx.language === "en" ? ` until ${endDate}` : ` deri më ${endDate}`)
      : (ctx.language === "en" ? " (indefinite duration)" : " (kohëzgjatje e pacaktuar)");
  }

  if (ctx.partner) {
    const resolved = resolvePartnerForLanguage(ctx.partner, ctx.language);
    vars.partner_name = `${ctx.partner.firstName} ${ctx.partner.lastName}`.trim();
    vars.partner_id = ctx.partner.idNumber;
    vars.partner_role = ctx.partner.role;
    vars.partner_commission = ctx.partner.commission;
    vars.partner_obligations = resolved.partnerObligations ?? "—";
    vars.itarena_obligations = resolved.itarenaObligations ?? "—";
    vars.commission_terms = resolved.commissionTerms ?? "—";
    vars.partner_territory = resolved.territory;
    vars.brand_usage = resolved.brandUsage ?? "—";
    vars.partner_contract_type = resolved.contractType;
    vars.notice_period = resolved.noticePeriod ?? "—";
    const endDate = ctx.partner.endDate;
    vars.contract_end_clause = endDate
      ? (ctx.language === "en" ? ` until ${endDate}` : ` deri më ${endDate}`)
      : (ctx.language === "en" ? " (indefinite duration)" : " (kohëzgjatje e pacaktuar)");
  }

  return vars;
}

export const TEMPLATE_VARIABLES = [
  "customer_name",
  "company_name",
  "customer_nipt",
  "customer_tax_id_label",
  "customer_address",
  "customer_phone",
  "customer_email",
  "contract_date",
  "contract_start",
  "contract_end",
  "total_price",
  "subtotal",
  "vat_amount",
  "currency",
  "payment_terms",
  "delivery_terms",
  "recurring_schedule",
  "notice_period",
  "termination_clause",
  "document_number",
  "itarena_representative",
  "itarena_title",
  "itarena_company",
  "itarena_nipt",
  "itarena_address",
  "employee_name",
  "employee_salary",
  "employee_position",
  "employee_id",
  "employee_working_hours",
  "employee_contract_type",
  "employer_duties",
  "employee_duties",
  "annual_leave",
  "contract_end_clause",
  "partner_name",
  "partner_id",
  "partner_role",
  "partner_commission",
  "partner_obligations",
  "itarena_obligations",
  "commission_terms",
  "partner_territory",
  "brand_usage",
  "partner_contract_type",
] as const;
