import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import { createDocumentSchema } from "@/lib/templates/schemas";
import { generateContractNumber } from "@/lib/templates/document-number";
import {
  defaultEmploymentPayload,
  defaultServicePayload,
  employmentPartyFromPayload,
} from "@/lib/templates/compose-body";
import type { ContractParty, EmploymentPayload, ServiceContractPayload } from "@/lib/templates/types";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await assertAdminApiAcl(session.user.id, "templates", "read");
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const status = searchParams.get("status");
  const q = searchParams.get("q")?.trim();

  const where: Prisma.ContractDocumentWhereInput = {};
  if (type) where.type = type;
  if (status) where.status = status;

  const docs = await db.contractDocument.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  const filtered = q
    ? docs.filter((d) => {
        const party = d.partyJson as ContractParty;
        const num = d.documentNumber.toLowerCase();
        return (
          num.includes(q.toLowerCase()) ||
          party.fullName?.toLowerCase().includes(q.toLowerCase()) ||
          party.companyName?.toLowerCase().includes(q.toLowerCase())
        );
      })
    : docs;

  return NextResponse.json(filtered);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await assertAdminApiAcl(session.user.id, "templates", "write");
  if (denied) return denied;

  const parsed = createDocumentSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const language = parsed.data.language ?? "sq";
  let payloadJson: ServiceContractPayload | EmploymentPayload;
  let partyJson = parsed.data.partyJson as ContractParty;

  if (parsed.data.type === "SERVICE_CONTRACT") {
    payloadJson = {
      ...defaultServicePayload(),
      ...(parsed.data.payloadJson as Partial<ServiceContractPayload>),
    };
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
