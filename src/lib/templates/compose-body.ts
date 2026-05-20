import type { ContractParty, EmploymentPayload, PartnerPayload, ServiceContractPayload, TemplateLanguage } from "./types";

/**
 * Remove the inline signature block that was historically appended to the
 * bottom of clause templates.  The block always starts with a bold party-name
 * line ("**Provider:**", "**Ofruesi:**", "**Employer:**", etc.) that is
 * followed by an underline row ("___…").  We also strip the trailing `---`
 * separator and any blank lines that precede the block.
 */
function stripSignatureBlock(markdown: string): string {
  const markerIdx = markdown.indexOf("_________________________________");
  if (markerIdx === -1) return markdown;

  // Take everything before the underline, then strip trailing ---/bold/blanks
  const lines = markdown.slice(0, markerIdx).split("\n");
  while (lines.length > 0) {
    const last = lines[lines.length - 1].trim();
    if (last === "" || last === "---" || /^\*\*.+:\*\*/.test(last)) {
      lines.pop();
    } else {
      break;
    }
  }
  return lines.join("\n").trimEnd();
}
import { getDefaultClauseBody } from "./clauses";
import { buildVariableMap } from "./variables";
import { interpolateMarkdown } from "./interpolate";
import { computeContractTotals } from "./calculate";
import { formatRecurringSchedule } from "./recurring";
import type { TemplateSettingsConfig } from "./types";
import {
  defaultEmploymentLocalized,
  defaultPartnerLocalized,
  defaultServiceLocalized,
  resolveEmploymentForLanguage,
  resolvePartnerForLanguage,
  resolveServiceForLanguage,
} from "./localized";

export function composeServiceBody(
  party: ContractParty,
  payload: ServiceContractPayload,
  language: TemplateLanguage,
  settings: TemplateSettingsConfig,
  documentNumber?: string
): string {
  const resolved = resolveServiceForLanguage(payload, language);
  // Pass the full payload (not just resolved) so buildVariableMap can access
  // services, products, showPrices, vatEnabled, etc. for the pricing_table variable.
  const vars = buildVariableMap({ language, party, settings, service: payload, documentNumber });
  const base = stripSignatureBlock(resolved.bodyMarkdown?.trim() || getDefaultClauseBody("SERVICE_CONTRACT", language));
  const totals = computeContractTotals(
    payload.services,
    payload.products,
    payload.vatEnabled
  );
  const pricingHeader = language === "en" ? "## Pricing summary\n\n" : "## Përmbledhje çmimesh\n\n";
  const pricingSection = vars.pricing_table
    ? `\n\n${pricingHeader}${vars.pricing_table}\n\n${vars.pricing_detail ?? ""}\n\n`
    : "";
  const recurring = formatRecurringSchedule(payload, language, totals.total);
  const recurringBlock = recurring
    ? `\n\n${language === "en" ? "## Recurring payments\n\n" : "## Pagesa të përsëritura\n\n"}${recurring}\n\n`
    : "";
  const notes = resolved.notes?.trim()
    ? `\n\n${language === "en" ? "## Notes\n\n" : "## Shënime\n\n"}${resolved.notes}\n\n`
    : "";
  return interpolateMarkdown(`${base}${pricingSection}${recurringBlock}${notes}`, vars);
}

export function composeEmploymentBody(
  party: ContractParty,
  payload: EmploymentPayload,
  language: TemplateLanguage,
  settings: TemplateSettingsConfig,
  documentNumber?: string
): string {
  const resolved = resolveEmploymentForLanguage(payload, language);
  const vars = buildVariableMap({ language, party, settings, employment: resolved, documentNumber });
  const base = stripSignatureBlock(resolved.bodyMarkdown?.trim() || getDefaultClauseBody("EMPLOYMENT", language));
  return interpolateMarkdown(base, vars);
}

export function composePartnerBody(
  party: ContractParty,
  payload: PartnerPayload,
  language: TemplateLanguage,
  settings: TemplateSettingsConfig,
  documentNumber?: string
): string {
  const resolved = resolvePartnerForLanguage(payload, language);
  const vars = buildVariableMap({ language, party, settings, partner: resolved, documentNumber });
  const base = stripSignatureBlock(resolved.bodyMarkdown?.trim() || getDefaultClauseBody("PARTNER_CONTRACT", language));
  return interpolateMarkdown(base, vars);
}

export function defaultServicePayload(): ServiceContractPayload {
  const today = new Date().toISOString().slice(0, 10);
  const sq = defaultServiceLocalized("sq");
  const en = defaultServiceLocalized("en");
  return {
    services: [],
    products: [],
    vatEnabled: true,
    vatPercent: 20,
    currency: "ALL",
    contractDate: today,
    startDate: today,
    paymentTerms: sq.paymentTerms,
    deliveryTerms: sq.deliveryTerms,
    localized: { sq, en },
    recurringEnabled: false,
    recurringFrequency: "MONTHLY",
    recurringServices: [],
    isB2B: true,
    bodyMarkdown: sq.bodyMarkdown,
    notes: sq.notes,
  };
}

export function defaultEmploymentPayload(): EmploymentPayload {
  const today = new Date().toISOString().slice(0, 10);
  const sq = defaultEmploymentLocalized("sq");
  const en = defaultEmploymentLocalized("en");
  return {
    firstName: "",
    lastName: "",
    idNumber: "",
    position: "",
    salary: "",
    workingHours: sq.workingHours,
    contractType: sq.contractType,
    localized: { sq, en },
    startDate: today,
    bodyMarkdown: sq.bodyMarkdown,
  };
}

export function defaultPartnerPayload(): PartnerPayload {
  const today = new Date().toISOString().slice(0, 10);
  const sq = defaultPartnerLocalized("sq");
  const en = defaultPartnerLocalized("en");
  return {
    firstName: "",
    lastName: "",
    idNumber: "",
    role: "",
    commission: "",
    contractDate: today,
    startDate: today,
    localized: { sq, en },
    bodyMarkdown: sq.bodyMarkdown,
  };
}

export function employmentPartyFromPayload(payload: EmploymentPayload): ContractParty {
  return {
    mode: "manual",
    fullName: `${payload.firstName} ${payload.lastName}`.trim(),
    idNumber: payload.idNumber,
  };
}

export function partnerPartyFromPayload(payload: PartnerPayload): ContractParty {
  return {
    mode: "manual",
    fullName: `${payload.firstName} ${payload.lastName}`.trim(),
    idNumber: payload.idNumber,
  };
}
