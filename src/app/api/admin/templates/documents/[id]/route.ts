import {  NextRequest, NextResponse  } from "next/server";
import { apiErr } from "@/lib/i18n/err";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import { updateDocumentSchema } from "@/lib/templates/schemas";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return apiErr(_req, "unauthorized", 401);
  const denied = await assertAdminApiAcl(session.user.id, "templates", "read");
  if (denied) return denied;

  const { id } = await params;
  const doc = await db.contractDocument.findUnique({ where: { id } });
  if (!doc) return apiErr(_req, "notFound", 404);
  return NextResponse.json(doc);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return apiErr(req, "unauthorized", 401);
  const denied = await assertAdminApiAcl(session.user.id, "templates", "write");
  if (denied) return denied;

  const { id } = await params;
  const parsed = updateDocumentSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const data: Prisma.ContractDocumentUpdateInput = { updatedById: session.user.id };
  if (parsed.data.partyJson) data.partyJson = parsed.data.partyJson as Prisma.InputJsonValue;
  if (parsed.data.payloadJson) data.payloadJson = parsed.data.payloadJson as Prisma.InputJsonValue;
  if (parsed.data.language) data.language = parsed.data.language;
  if (parsed.data.status) data.status = parsed.data.status;

  const doc = await db.contractDocument.update({ where: { id }, data });
  return NextResponse.json(doc);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return apiErr(_req, "unauthorized", 401);
  const denied = await assertAdminApiAcl(session.user.id, "templates", "write");
  if (denied) return denied;

  const { id } = await params;
  await db.contractDocument.update({
    where: { id },
    data: { status: "ARCHIVED", updatedById: session.user.id },
  });
  return NextResponse.json({ ok: true });
}
