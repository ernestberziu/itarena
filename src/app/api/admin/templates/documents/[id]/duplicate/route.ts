import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import { generateContractNumber } from "@/lib/templates/document-number";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await assertAdminApiAcl(session.user.id, "templates", "write");
  if (denied) return denied;

  const { id } = await params;
  const source = await db.contractDocument.findUnique({ where: { id } });
  if (!source) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const doc = await db.contractDocument.create({
    data: {
      documentNumber: generateContractNumber(),
      type: source.type,
      status: "DRAFT",
      language: source.language,
      templateId: source.templateId,
      partyJson: source.partyJson as Prisma.InputJsonValue,
      payloadJson: source.payloadJson as Prisma.InputJsonValue,
      createdById: session.user.id,
    },
  });

  return NextResponse.json(doc, { status: 201 });
}
