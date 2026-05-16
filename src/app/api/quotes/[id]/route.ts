import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";

const patchSchema = z.object({
  status: z.enum(["PENDING", "REVIEWING", "SENT", "ACCEPTED", "REJECTED", "REVISION_REQUESTED"]).optional(),
  total: z.number().positive().optional(),
  notes: z.string().optional(),
  validUntil: z.string().optional(),
  pdfUrl: z.string().url().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const quote = await db.quote.findUnique({ where: { id } });
  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isStaff = ["ADMIN", "SALES"].includes(session.user.role);
  const isOwner = quote.requestedById === session.user.id;

  // Clients can only ACCEPT or REJECT
  if (!isStaff && !isOwner) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!isStaff && parsed.data.status && !["ACCEPTED", "REJECTED"].includes(parsed.data.status)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (isStaff) {
    const denied = await assertAdminApiAcl(session.user.id, "quotes", "write");
    if (denied) return denied;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.status) updateData.status = parsed.data.status;
  if (parsed.data.total !== undefined && isStaff) updateData.total = parsed.data.total;
  if (parsed.data.notes !== undefined && isStaff) updateData.internalNote = parsed.data.notes;
  if (parsed.data.validUntil && isStaff) updateData.validUntil = new Date(parsed.data.validUntil);
  if (parsed.data.pdfUrl && isStaff) updateData.pdfUrl = parsed.data.pdfUrl;

  await db.quote.update({ where: { id }, data: updateData });

  await db.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "UPDATE",
      resource: "Quote",
      resourceId: id,
    },
  });

  return NextResponse.json({ success: true });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const quote = await db.quote.findUnique({ where: { id } });
  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isStaff = ["ADMIN", "SALES"].includes(session.user.role);
  if (!isStaff && quote.requestedById !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (isStaff) {
    const denied = await assertAdminApiAcl(session.user.id, "quotes", "read");
    if (denied) return denied;
  }

  return NextResponse.json(quote);
}
