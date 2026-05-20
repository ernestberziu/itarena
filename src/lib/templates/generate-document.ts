import { db } from "@/lib/db";
import {
  composeEmploymentBody,
  composePartnerBody,
  composeServiceBody,
  employmentPartyFromPayload,
  partnerPartyFromPayload,
} from "./compose-body";
import { buildContractPdfBuffer } from "./export-contract-pdf";
import { getTemplateSettings } from "./settings";
import type {
  ContractParty,
  EmploymentPayload,
  PartnerPayload,
  ServiceContractPayload,
  TemplateLanguage,
} from "./types";
import { employmentPayloadSchema, partnerPayloadSchema, servicePayloadSchema } from "./schemas";
import { migrateEmploymentPayload, migratePartnerPayload, migrateServicePayload } from "./localized";
import { normalizeServicePayload } from "./recurring";

type PdfBuildResult = {
  buffer: Buffer;
  filename: string;
};

export async function buildPdfBufferForDocument(
  documentId: string,
  languageOverride?: TemplateLanguage
): Promise<PdfBuildResult> {
  const doc = await db.contractDocument.findUnique({ where: { id: documentId } });
  if (!doc) throw new Error("Document not found");

  const settings = await getTemplateSettings();
  const party = doc.partyJson as ContractParty;
  const language = languageOverride ?? (doc.language as TemplateLanguage);

  let markdown: string;
  let variant: "service" | "employment" | "partner";
  let title: string;
  let counterpartyName: string | undefined;

  if (doc.type === "SERVICE_CONTRACT") {
    const raw = servicePayloadSchema.parse(doc.payloadJson);
    const payload = normalizeServicePayload(
      migrateServicePayload(raw as Record<string, unknown>, language)
    ) as ServiceContractPayload;
    markdown = composeServiceBody(party, payload, language, settings, doc.documentNumber);
    variant = "service";
    title = language === "en" ? "Service Agreement" : "Kontratë Shërbimi";
  } else if (doc.type === "PARTNER_CONTRACT") {
    const raw = partnerPayloadSchema.parse(doc.payloadJson);
    const payload = migratePartnerPayload(
      raw as Record<string, unknown>,
      language
    ) as PartnerPayload;
    const partnerParty = partnerPartyFromPayload(payload);
    markdown = composePartnerBody(partnerParty, payload, language, settings, doc.documentNumber);
    variant = "partner";
    title = language === "en" ? "Partnership Agreement" : "Kontratë Partneriteti";
    counterpartyName = `${payload.firstName} ${payload.lastName}`.trim();
  } else {
    const raw = employmentPayloadSchema.parse(doc.payloadJson);
    const payload = migrateEmploymentPayload(
      raw as Record<string, unknown>, language
    ) as EmploymentPayload;
    const empParty = employmentPartyFromPayload(payload);
    markdown = composeEmploymentBody(empParty, payload, language, settings, doc.documentNumber);
    variant = "employment";
    title = language === "en" ? "Employment Agreement" : "Kontratë Pune";
    counterpartyName = `${payload.firstName} ${payload.lastName}`.trim();
  }

  const buffer = await buildContractPdfBuffer({
    title,
    documentNumber: doc.documentNumber,
    markdown,
    party,
    settings,
    language,
    variant,
    counterpartyName,
  });

  return { buffer, filename: `${doc.documentNumber}.pdf` };
}

/** Mark document as GENERATED (no cloud upload required). */
export async function generateContractPdfForDocument(documentId: string) {
  const doc = await db.contractDocument.findUnique({ where: { id: documentId } });
  if (!doc) throw new Error("Document not found");

  return db.contractDocument.update({
    where: { id: documentId },
    data: {
      status: "GENERATED",
      pdfGeneratedAt: new Date(),
    },
  });
}
