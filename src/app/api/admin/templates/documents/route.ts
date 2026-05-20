import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import { loadAdminDocumentsList } from "@/lib/admin-documents-list";
import { createDocumentSchema } from "@/lib/templates/schemas";
import { generateContractNumber } from "@/lib/templates/document-number";
import {
  defaultEmploymentPayload,
  defaultPartnerPayload,
  defaultServicePayload,
  employmentPartyFromPayload,
  partnerPartyFromPayload,
} from "@/lib/templates/compose-body";
import type { ContractParty, EmploymentPayload, PartnerPayload, ServiceContractPayload } from "@/lib/templates/types";
import { paginatedResponse, parseListPageParams } from "@/lib/admin-list-pagination";

export type DocumentListRow = {
  id: string;
  documentNumber: string;
  type: string;
  status: string;
  language: string;
  partyJson: ContractParty;
  pdfUrl: string | null;
  createdAt: string;
};

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await assertAdminApiAcl(session.user.id, "templates", "read");
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const { page, pageSize, skip } = parseListPageParams(searchParams);
  const { items, total } = await loadAdminDocumentsList({
    type: searchParams.get("type"),
    status: searchParams.get("status"),
    q: searchParams.get("q"),
    skip,
    take: pageSize,
  });

  return NextResponse.json(paginatedResponse(items, total, page, pageSize));
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await assertAdminApiAcl(session.user.id, "templates", "write");
  if (denied) return denied;

  const parsed = createDocumentSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const language = parsed.data.language ?? "sq";
  let payloadJson: ServiceContractPayload | EmploymentPayload | PartnerPayload;
  let partyJson = parsed.data.partyJson as ContractParty;

  if (parsed.data.type === "SERVICE_CONTRACT") {
    payloadJson = {
      ...defaultServicePayload(),
      ...(parsed.data.payloadJson as Partial<ServiceContractPayload>),
    };
  } else if (parsed.data.type === "PARTNER_CONTRACT") {
    payloadJson = {
      ...defaultPartnerPayload(),
      ...(parsed.data.payloadJson as Partial<PartnerPayload>),
    };
    if (!partyJson.fullName?.trim()) {
      partyJson = partnerPartyFromPayload(payloadJson);
    }
  } else {
    payloadJson = {
      ...defaultEmploymentPayload(),
      ...(parsed.data.payloadJson as Partial<EmploymentPayload>),
    };
    if (!partyJson.fullName?.trim()) {
      partyJson = employmentPartyFromPayload(payloadJson);
    }
  }

  const doc = await db.contractDocument.create({
    data: {
      documentNumber: generateContractNumber(),
      type: parsed.data.type,
      status: "DRAFT",
      language,
      templateId: parsed.data.templateId ?? null,
      partyJson: partyJson as Prisma.InputJsonValue,
      payloadJson: payloadJson as Prisma.InputJsonValue,
      createdById: session.user.id,
    },
  });

  return NextResponse.json(doc, { status: 201 });
}
