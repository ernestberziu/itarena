import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { assertPublicShareAccess } from "@/lib/public-share/assert-share-access";

const schema = z.object({
  body: z.string().min(1),
});

type Params = { params: Promise<{ token: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { token } = await params;
  const access = await assertPublicShareAccess(token);
  if (!access.ok) return NextResponse.json({ error: access.reason }, { status: 404 });

  const { share } = access;
  if (share.resourceType !== "TICKET" || !share.ticketId) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const ticket = await db.ticket.findUnique({
    where: { id: share.ticketId },
    select: { id: true, number: true, title: true, status: true, createdById: true },
  });
  if (!ticket) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (ticket.status === "CLOSED") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const comment = await db.ticketComment.create({
    data: {
      ticketId: ticket.id,
      authorId: null,
      guestAuthorName: share.clientName,
      publicShareId: share.id,
      body: parsed.data.body.trim(),
      isInternal: false,
      attachments: "[]",
    },
  });

  if (ticket.status === "PENDING_CLIENT") {
    await db.ticket.update({
      where: { id: ticket.id },
      data: { status: "IN_PROGRESS" },
    });
    await db.ticketHistory.create({
      data: {
        ticketId: ticket.id,
        changedById: ticket.createdById,
        field: "status",
        oldValue: "PENDING_CLIENT",
        newValue: "IN_PROGRESS",
      },
    });
  }

  await db.ticket.update({ where: { id: ticket.id }, data: { updatedAt: new Date() } });

  const { emitNotificationSafe } = await import("@/lib/notifications");
  const { excerpt } = await import("@/lib/notifications/helpers");
  emitNotificationSafe({
    type: "PUBLIC_SHARE_GUEST_COMMENT",
    entity: { type: "ticket", id: ticket.id },
    payload: {
      ticketId: ticket.id,
      ticketNumber: ticket.number,
      title: ticket.title,
      clientName: share.clientName,
      excerpt: excerpt(parsed.data.body),
    },
  });
  if (ticket.status === "PENDING_CLIENT") {
    emitNotificationSafe({
      type: "TICKET_STATUS_CHANGED",
      entity: { type: "ticket", id: ticket.id },
      dedupeKey: `ticket:${ticket.id}:status:IN_PROGRESS`,
      payload: {
        ticketId: ticket.id,
        ticketNumber: ticket.number,
        title: ticket.title,
        oldStatus: "PENDING_CLIENT",
        newStatus: "IN_PROGRESS",
      },
    });
  }

  return NextResponse.json(
    {
      id: comment.id,
      body: comment.body,
      createdAt: comment.createdAt.toISOString(),
      guestAuthorName: share.clientName,
    },
    { status: 201 }
  );
}
