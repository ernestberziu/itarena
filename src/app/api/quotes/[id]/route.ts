import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import { QUOTE_MONEY_MAX, isQuoteMoneyInRange } from "@/lib/quote-money";
import { canAccessPortalQuote, portalUser } from "@/lib/portal/access";

const patchSchema = z.object({
  status: z.enum(["PENDING", "REVIEWING", "SENT", "ACCEPTED", "REJECTED", "REVISION_REQUESTED"]).optional(),
  total: z
    .number()
    .positive()
    .max(QUOTE_MONEY_MAX)
    .refine(isQuoteMoneyInRange, { message: "Total exceeds allowed range" })
    .optional(),
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
  if (!parsed.success) {
    const totalIssue = parsed.error.issues.find((issue) => issue.path[0] === "total");
    if (totalIssue) {
      return NextResponse.json(
        { error: "Total exceeds the maximum allowed amount (99,999,999.99)." },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }

  const quote = await db.quote.findUnique({ where: { id } });
  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isStaff = ["ADMIN", "SALES"].includes(session.user.role);
  const clientUser = portalUser(session);
  const canAccess = isStaff || canAccessPortalQuote(clientUser, quote);

  if (!canAccess) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!isStaff && parsed.data.status && !["ACCEPTED", "REJECTED"].includes(parsed.data.status)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (isStaff) {
    const denied = await assertAdminApiAcl(session.user.id, "quotes", "write");
    if (denied) return denied;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.status) updateData.status = parsed.data.status;
  if (parsed.data.total !== undefined && isStaff) {
    updateData.total = Math.round(parsed.data.total * 100) / 100;
  }
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

  if (parsed.data.status && parsed.data.status !== quote.status) {
    const { emitNotificationSafe } = await import("@/lib/notifications");
    emitNotificationSafe({
      type: "QUOTE_STATUS_CHANGED",
      actorId: session.user.id,
      entity: { type: "quote", id },
      dedupeKey: `quote:${id}:status:${parsed.data.status}`,
      payload: {
        quoteId: id,
        quoteNumber: quote.quoteNumber,
        title: quote.title,
        newStatus: parsed.data.status,
        oldStatus: quote.status,
        status: parsed.data.status,
      },
    });
  }

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
  const clientUser = portalUser(session);
  if (!isStaff && !canAccessPortalQuote(clientUser, quote)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (isStaff) {
    const denied = await assertAdminApiAcl(session.user.id, "quotes", "read");
    if (denied) return denied;
  }

  return NextResponse.json(quote);
}
