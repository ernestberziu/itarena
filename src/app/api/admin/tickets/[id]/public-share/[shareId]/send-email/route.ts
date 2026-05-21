import {  NextRequest, NextResponse  } from "next/server";
import { apiErr } from "@/lib/i18n/err";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import { canStaffAccessTicket } from "@/lib/admin-tickets-scope";
import { sendShareAccessEmail } from "@/lib/public-share/send-share-email";

type Params = { params: Promise<{ id: string; shareId: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return apiErr(_req, "unauthorized", 401);
  const denied = await assertAdminApiAcl(session.user.id, "tickets", "write");
  if (denied) return denied;

  const { id: ticketId, shareId } = await params;
  const ticket = await db.ticket.findUnique({
    where: { id: ticketId },
    select: { id: true, assignedToId: true },
  });
  if (!ticket || !(await canStaffAccessTicket(session.user.id, ticket))) {
    return apiErr(_req, "notFound", 404);
  }

  const share = await db.clientResourceShare.findFirst({
    where: { id: shareId, ticketId, resourceType: "TICKET" },
    select: { id: true },
  });
  if (!share) return apiErr(_req, "notFound", 404);

  const result = await sendShareAccessEmail(shareId);
  if (result.reason === "NO_EMAIL") {
    return NextResponse.json({ error: "No recipient email on this link" }, { status: 400 });
  }
  return NextResponse.json({ ok: true, emailSent: result.sent });
}
