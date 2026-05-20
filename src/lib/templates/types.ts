export type TemplateLanguage = "sq" | "en";
export type DocumentType = "SERVICE_CONTRACT" | "EMPLOYMENT" | "PARTNER_CONTRACT";
export type DocumentStatus = "DRAFT" | "GENERATED" | "ARCHIVED";

export type PartyMode = "portal" | "manual";

export type ContractParty = {
  mode: PartyMode;
  userId?: string;
  companyId?: string;
  fullName: string;
  companyName?: string;
  nuis?: string;
  /** Personal ID — used in templates when NIPT is empty */
  idNumber?: string;
  address?: string;
  phone?: string;
  email?: string;
};

export type LineItem = {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  vatPercent: number;
  /** Per-item recurring frequency — only meaningful for recurringServices items */
  frequency?: RecurringFrequency;
};

export type RecurringFrequency =
  | "WEEKLY"
  | "BIWEEKLY"
  | "MONTHLY"
  | "QUARTERLY"
  | "SEMIANNUAL"
  | "YEARLY";

export type BilingualLocalized<T> = {
  sq: T;
  en: T;
};

export type ServiceLocalizedContent = {
  bodyMarkdown: string;
  paymentTerms: string;
  deliveryTerms: string;
  notes?: string;
  noticePeriod?: string;
};

export type EmploymentLocalizedContent = {
  bodyMarkdown: string;
  workingHours: string;
  contractType: string;
  noticePeriod?: string;
  employerDuties: string;
  employeeDuties: string;
  annualLeave: string;
};

export type ServiceContractPayload = {
  services: LineItem[];
  products: LineItem[];
  vatEnabled: boolean;
  vatPercent: number;
  currency: string;
  contractDate: string;
  startDate: string;
  endDate?: string;
  /** Resolved from localized[active language] at compose time; kept for legacy saves. */
  paymentTerms: string;
  deliveryTerms: string;
  localized: BilingualLocalized<ServiceLocalizedContent>;
  recurringEnabled: boolean;
  recurringFrequency: RecurringFrequency;
  recurringServices: LineItem[];
  recurringAmount?: number;
  recurringStartDate?: string;
  notes?: string;
  isB2B: boolean;
  bodyMarkdown: string;
  /** When true (default), prices/qty are shown in the pricing table. When false only names are listed. */
  showPrices?: boolean;
  /** When true, a VAT column is added to the recurring payments table. */
  recurringVatEnabled?: boolean;
};

export type EmploymentPayload = {
  firstName: string;
  lastName: string;
  idNumber: string;
  position: string;
  salary: string;
  workingHours: string;
  contractType: string;
  startDate: string;
  endDate?: string;
  localized: BilingualLocalized<EmploymentLocalizedContent>;
  bodyMarkdown: string;
};

export type PartnerLocalizedContent = {
  bodyMarkdown: string;
  partnerObligations: string;
  itarenaObligations: string;
  commissionTerms: string;
  territory: string;
  brandUsage: string;
  contractType: string;
  noticePeriod?: string;
};

export type PartnerPayload = {
  firstName: string;
  lastName: string;
  idNumber: string;
  role: string;
  commission: string;
  contractDate: string;
  startDate: string;
  endDate?: string;
  localized: BilingualLocalized<PartnerLocalizedContent>;
  bodyMarkdown: string;
};

export type TemplateSettingsConfig = {
  defaultLanguage: TemplateLanguage;
  authorizedRepresentative: string;
  representativeTitle: string;
  companyLegalName: string;
  companyNuis: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyBank?: string;
  legalDisclaimer?: string;
};

export const DEFAULT_TEMPLATE_SETTINGS: TemplateSettingsConfig = {
  defaultLanguage: "sq",
  authorizedRepresentative: "Përfaqësuesi i Autorizuar",
  representativeTitle: "Administrator",
  companyLegalName: "IT Arena sh.p.k.",
  companyNuis: "M11905015A",
  companyAddress: "Tiranë, Shqipëri",
  companyPhone: "",
  companyEmail: "info@itarena.al",
  legalDisclaimer:
    "Ky dokument është gjeneruar nga sistemi IT Arena. Rekomandohet rishikimi nga këshilltar ligjor para nënshkrimit.",
};
