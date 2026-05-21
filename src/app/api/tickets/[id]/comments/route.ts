import {  NextRequest, NextResponse  } from "next/server";
import { apiErr } from "@/lib/i18n/err";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import { canCommentOnPortalTicket, portalUser } from "@/lib/portal/access";
import { emitNotificationSafe } from "@/lib/notifications";
import { actorDisplayName, excerpt } from "@/lib/notifications/helpers";

const schema = z.object({
  body: z.string().min(1),
  isInternal: z.boolean().optional().default(false),
  attachments: z.array(z.string()).optional().default([]),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return apiErr(req, "unauthorized", 401);

  const { id } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const ticket = await db.ticket.findUnique({ where: { id } });
  if (!ticket) return apiErr(req, "notFound", 404);

  const isStaff = ["ADMIN", "ENGINEER", "SALES", "OPS"].includes(session.user.role);
  const clientUser = portalUser(session);

  if (!isStaff && !canCommentOnPortalTicket(clientUser, ticket)) {
    return apiErr(req, "forbidden", 403);
  }

  if (isStaff) {
    const denied = await assertAdminApiAcl(session.user.id, "tickets", "write");
    if (denied) return denied;
  }

  if (ticket.status === "CLOSED") {
    if (!isStaff) {
      return apiErr(req, "forbidden", 403);
    }
    if (!parsed.data.isInternal) {
      return NextResponse.json(
        { error: "Closed tickets only accept internal notes" },
        { status: 400 }
      );
    }
  }

  // Staff: isInternal true = internal (staff-only); false = external (customer-visible in portal). Clients always post external.
  const isInternal = isStaff ? parsed.data.isInternal : false;

  const comment = await db.ticketComment.create({
    data: {
      ticketId: id,
      authorId: session.user.id,
      body: parsed.data.body,
      isInternal,
      attachments: JSON.stringify(parsed.data.attachments),
    },
  });

  // If client responds while pending, update status back to in_progress
  if (!isStaff && ticket.status === "PENDING_CLIENT") {
    await db.ticket.update({
      where: { id },
      data: { status: "IN_PROGRESS" },
    });
    await db.ticketHistory.create({
      data: {
        ticketId: id,
        changedById: session.user.id,
        field: "status",
        oldValue: "PENDING_CLIENT",
        newValue: "IN_PROGRESS",
      },
    });
  }

  // Update ticket updatedAt
  await db.ticket.update({ where: { id }, data: { updatedAt: new Date() } });

  const actorName = await actorDisplayName(session.user.id);
  emitNotificationSafe({
    type: "TICKET_COMMENT_ADDED",
    actorId: session.user.id,
    entity: { type: "ticket", id },
    payload: {
      ticketId: id,
      ticketNumber: ticket.number,
      title: ticket.title,
      isInternal,
      actorName,
      excerpt: excerpt(parsed.data.body),
    },
  });

  if (!isStaff && ticket.status === "PENDING_CLIENT") {
    emitNotificationSafe({
      type: "TICKET_STATUS_CHANGED",
      actorId: session.user.id,
      entity: { type: "ticket", id },
      dedupeKey: `ticket:${id}:status:IN_PROGRESS`,
      payload: {
        ticketId: id,
        ticketNumber: ticket.number,
        title: ticket.title,
        oldStatus: "PENDING_CLIENT",
        newStatus: "IN_PROGRESS",
      },
    });
  }

  return NextResponse.json(comment, { status: 201 });
}
