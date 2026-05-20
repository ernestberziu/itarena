import { z } from "zod";

export const lineItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  quantity: z.number().min(0),
  unitPrice: z.number().min(0),
  vatPercent: z.number().min(0).max(100),
  frequency: z.enum(["WEEKLY", "BIWEEKLY", "MONTHLY", "QUARTERLY", "SEMIANNUAL", "YEARLY"]).optional(),
});

export const partySchema = z.object({
  mode: z.enum(["portal", "manual"]),
  userId: z.string().optional(),
  companyId: z.string().optional(),
  fullName: z.string().min(2),
  companyName: z.string().optional(),
  nuis: z.string().optional(),
  idNumber: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
});

const serviceLocalizedSchema = z.object({
  bodyMarkdown: z.string().min(1),
  paymentTerms: z.string().min(1),
  deliveryTerms: z.string().min(1),
  notes: z.string().optional(),
  noticePeriod: z.string().optional(),
});

const employmentLocalizedSchema = z.object({
  bodyMarkdown: z.string().min(1),
  workingHours: z.string().min(1),
  contractType: z.string().min(1),
  noticePeriod: z.string().optional(),
  // Fields added in later migrations — optional here so old saved documents don't fail validation
  employerDuties: z.string().optional().default(""),
  employeeDuties: z.string().optional().default(""),
  annualLeave: z.string().optional().default(""),
});

export const servicePayloadSchema = z.object({
  services: z.array(lineItemSchema),
  products: z.array(lineItemSchema),
  vatEnabled: z.boolean(),
  vatPercent: z.number().min(0).max(100),
  currency: z.string().min(1),
  contractDate: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().optional(),
  paymentTerms: z.string().optional(),
  deliveryTerms: z.string().optional(),
  localized: z
    .object({
      sq: serviceLocalizedSchema,
      en: serviceLocalizedSchema,
    })
    .optional(),
  recurringEnabled: z.boolean().optional().default(false),
  recurringFrequency: z
    .enum(["WEEKLY", "BIWEEKLY", "MONTHLY", "QUARTERLY", "SEMIANNUAL", "YEARLY"])
    .optional()
    .default("MONTHLY"),
  recurringServices: z.array(lineItemSchema).optional().default([]),
  recurringAmount: z.number().min(0).optional(),
  recurringStartDate: z.string().optional(),
  notes: z.string().optional(),
  isB2B: z.boolean(),
  bodyMarkdown: z.string().optional(),
  showPrices: z.boolean().optional().default(true),
  recurringVatEnabled: z.boolean().optional().default(false),
});

export const employmentPayloadSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  idNumber: z.string().min(1),
  position: z.string().min(1),
  salary: z.string().min(1),
  workingHours: z.string().min(1),
  contractType: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().optional(),
  localized: z
    .object({
      sq: employmentLocalizedSchema,
      en: employmentLocalizedSchema,
    })
    .optional(),
  bodyMarkdown: z.string().optional(),
});

const partnerLocalizedSchema = z.object({
  bodyMarkdown: z.string().min(1),
  partnerObligations: z.string().optional().default(""),
  itarenaObligations: z.string().optional().default(""),
  commissionTerms: z.string().optional().default(""),
  territory: z.string().min(1),
  brandUsage: z.string().optional().default(""),
  contractType: z.string().min(1),
  noticePeriod: z.string().optional(),
});

export const partnerPayloadSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  idNumber: z.string().min(1),
  role: z.string().min(1),
  commission: z.string().min(1),
  contractDate: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().optional(),
  localized: z
    .object({
      sq: partnerLocalizedSchema,
      en: partnerLocalizedSchema,
    })
    .optional(),
  bodyMarkdown: z.string().optional(),
});

export const createDocumentSchema = z.object({
  type: z.enum(["SERVICE_CONTRACT", "EMPLOYMENT", "PARTNER_CONTRACT"]),
  language: z.enum(["sq", "en"]).optional(),
  partyJson: partySchema,
  payloadJson: z.record(z.string(), z.unknown()),
  templateId: z.string().optional(),
});

export const updateDocumentSchema = z.object({
  partyJson: partySchema.optional(),
  payloadJson: z.record(z.string(), z.unknown()).optional(),
  language: z.enum(["sq", "en"]).optional(),
  status: z.enum(["DRAFT", "GENERATED", "ARCHIVED"]).optional(),
});

export const libraryTemplateSchema = z.object({
  name: z.string().min(1).max(120),
  type: z.enum(["SERVICE_CONTRACT", "EMPLOYMENT", "PARTNER_CONTRACT"]),
  bodyMarkdownSq: z.string().min(10),
  bodyMarkdownEn: z.string().min(10),
  defaultLanguage: z.enum(["sq", "en"]).optional(),
  isDefault: z.boolean().optional(),
});
