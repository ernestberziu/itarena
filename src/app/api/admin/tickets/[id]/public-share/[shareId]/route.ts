import {  NextRequest, NextResponse  } from "next/server";
import { apiErr } from "@/lib/i18n/err";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import { canStaffAccessTicket } from "@/lib/admin-tickets-scope";
import { regeneratePublicSharePasscode } from "@/lib/public-share/create-share";

type Params = { params: Promise<{ id: string; shareId: string }> };

async function assertTicketShareAccess(
  userId: string,
  ticketId: string,
  shareId: string
) {
  const ticket = await db.ticket.findUnique({
    where: { id: ticketId },
    select: { id: true, assignedToId: true },
  });
  if (!ticket) return null;
  if (!(await canStaffAccessTicket(userId, ticket))) return null;

  const share = await db.clientResourceShare.findFirst({
    where: { id: shareId, ticketId, resourceType: "TICKET" },
  });
  return share;
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return apiErr(_req, "unauthorized", 401);
  const denied = await assertAdminApiAcl(session.user.id, "tickets", "write");
  if (denied) return denied;

  const { id: ticketId, shareId } = await params;
  const share = await assertTicketShareAccess(session.user.id, ticketId, shareId);
  if (!share) return apiErr(_req, "notFound", 404);

  await db.clientResourceShare.update({
    where: { id: shareId },
    data: { revokedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return apiErr(req, "unauthorized", 401);
  const denied = await assertAdminApiAcl(session.user.id, "tickets", "write");
  if (denied) return denied;

  const { id: ticketId, shareId } = await params;
  const share = await assertTicketShareAccess(session.user.id, ticketId, shareId);
  if (!share) return apiErr(req, "notFound", 404);

  const body = await req.json().catch(() => ({}));
  if (body?.action !== "regenerate_passcode") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const { passcode } = await regeneratePublicSharePasscode(shareId);
  return NextResponse.json({ passcode });
}
