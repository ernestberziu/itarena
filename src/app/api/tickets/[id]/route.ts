import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import {
  WORKING_HOURS_PER_DAY,
  MAX_RESOLUTION_HOURS,
  normalizeTicketEstimate,
  slaDeadlineFromEstimate,
} from "@/lib/ticket-estimate";
import { filterTicketHistoryForClient } from "@/lib/ticket-activity";

const patchSchema = z.object({
  status: z
    .enum(["OPEN", "ASSIGNED", "IN_PROGRESS", "PAUSED", "PENDING_CLIENT", "RESOLVED", "CLOSED"])
    .optional(),
  assignedToId: z.union([z.string(), z.null()]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  rating: z.number().min(1).max(5).optional(),
  estimatedDays: z.coerce.number().int().min(0).max(62).optional(),
  estimatedHours: z.coerce.number().int().min(0).max(500).optional(),
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

  const ticket = await db.ticket.findUnique({ where: { id } });
  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isStaff = ["ADMIN", "ENGINEER", "SALES", "OPS"].includes(session.user.role);
  const isOwner = ticket.createdById === session.user.id;

  if (!isStaff && !isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (isStaff) {
    const denied = await assertAdminApiAcl(session.user.id, "tickets", "write");
    if (denied) return denied;
  }

  const updateData: Record<string, unknown> = {};
  const historyEntries: Array<{ field: string; oldValue: string | null; newValue: string | null }> = [];

  if (parsed.data.status && parsed.data.status !== ticket.status) {
    historyEntries.push({
      field: "status",
      oldValue: ticket.status,
      newValue: parsed.data.status,
    });
    updateData.status = parsed.data.status;

    if (parsed.data.status === "RESOLVED") updateData.resolvedAt = new Date();
    if (parsed.data.status === "CLOSED") updateData.closedAt = new Date();
    if (parsed.data.status === "IN_PROGRESS" && ticket.status === "RESOLVED") {
      updateData.resolvedAt = null;
    }
  }

  if (parsed.data.assignedToId !== undefined && isStaff) {
    const nextAssignee = parsed.data.assignedToId ?? null;
    const prevAssignee = ticket.assignedToId ?? null;
    if (nextAssignee !== prevAssignee) {
      updateData.assignedToId = nextAssignee;
      if (nextAssignee) updateData.status = "ASSIGNED";
      historyEntries.push({
        field: "assignedTo",
        oldValue: prevAssignee,
        newValue: nextAssignee,
      });
    }
  }

  if (parsed.data.priority !== undefined && isStaff && parsed.data.priority !== ticket.priority) {
    updateData.priority = parsed.data.priority;
    historyEntries.push({
      field: "priority",
      oldValue: ticket.priority,
      newValue: parsed.data.priority,
    });
  }

  if (
    (parsed.data.estimatedDays !== undefined || parsed.data.estimatedHours !== undefined) &&
    isStaff
  ) {
    const dIn =
      parsed.data.estimatedDays !== undefined
        ? parsed.data.estimatedDays
        : (ticket.estimatedDays ?? undefined);
    const hIn =
      parsed.data.estimatedHours !== undefined
        ? parsed.data.estimatedHours
        : (ticket.estimatedHours ?? undefined);
    const sum = (dIn ?? 0) * WORKING_HOURS_PER_DAY + (hIn ?? 0);
    if (sum > MAX_RESOLUTION_HOURS) {
      return NextResponse.json(
        {
          error: "Invalid estimate",
          message: `Combined estimate must not exceed ${MAX_RESOLUTION_HOURS} hours (${WORKING_HOURS_PER_DAY}h per calendar day + additional hours).`,
        },
        { status: 400 }
      );
    }

    const estimate = normalizeTicketEstimate(dIn, hIn);

    const prevDays = ticket.estimatedDays;
    const prevHours = ticket.estimatedHours;
    const nextDeadline = slaDeadlineFromEstimate(ticket.createdAt, estimate.resolutionHours);
    const prevIso = ticket.slaDeadline?.toISOString() ?? null;
    const nextIso = nextDeadline?.toISOString() ?? null;

    const estimateOrDeadlineChanged =
      estimate.estimatedDays !== prevDays ||
      estimate.estimatedHours !== prevHours ||
      prevIso !== nextIso;

    if (estimateOrDeadlineChanged) {
      if (estimate.estimatedDays !== prevDays) {
        historyEntries.push({
          field: "estimatedDays",
          oldValue: prevDays === null || prevDays === undefined ? null : String(prevDays),
          newValue: estimate.estimatedDays === null ? null : String(estimate.estimatedDays),
        });
      }
      if (estimate.estimatedHours !== prevHours) {
        historyEntries.push({
          field: "estimatedHours",
          oldValue: prevHours === null || prevHours === undefined ? null : String(prevHours),
          newValue: estimate.estimatedHours === null ? null : String(estimate.estimatedHours),
        });
      }
      if (prevIso !== nextIso) {
        historyEntries.push({
          field: "slaDeadline",
          oldValue: prevIso,
          newValue: nextIso,
        });
      }

      updateData.estimatedDays = estimate.estimatedDays ?? null;
      updateData.estimatedHours = estimate.estimatedHours ?? null;
      updateData.slaDeadline = nextDeadline;

      const now = Date.now();
      if (nextDeadline == null) {
        updateData.slaBreached = false;
        updateData.slaWarned = false;
      } else if (nextDeadline.getTime() > now) {
        updateData.slaBreached = false;
        updateData.slaWarned = false;
      } else {
        updateData.slaBreached = true;
        updateData.slaWarned = true;
      }
    }
  }

  if (
    parsed.data.rating !== undefined &&
    isOwner &&
    parsed.data.rating !== ticket.rating
  ) {
    updateData.rating = parsed.data.rating;
  }

  if (Object.keys(updateData).length === 0 && historyEntries.length === 0) {
    return NextResponse.json({ success: true });
  }

  await db.ticket.update({ where: { id }, data: updateData });

  revalidatePath(`/admin/tickets/${id}`);
  revalidatePath(`/en/admin/tickets/${id}`);
  revalidatePath("/admin/tickets");
  revalidatePath("/en/admin/tickets");
  revalidatePath(`/portal/tickets/${id}`);
  revalidatePath(`/en/portal/tickets/${id}`);
  revalidatePath("/portal/tickets");
  revalidatePath("/en/portal/tickets");

  if (historyEntries.length > 0) {
    await db.ticketHistory.createMany({
      data: historyEntries.map((h) => ({
        ticketId: id,
        changedById: session.user.id,
        ...h,
      })),
    });
  }

  await db.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "UPDATE",
      resource: "Ticket",
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
  const ticket = await db.ticket.findUnique({
    where: { id },
    include: {
      createdBy: { select: { id: true, firstName: true, lastName: true } },
      assignedTo: { select: { id: true, firstName: true, lastName: true } },
      comments: {
        include: { author: { select: { firstName: true, lastName: true, role: true } } },
        orderBy: { createdAt: "asc" },
      },
      history: {
        include: { changedBy: { select: { firstName: true, lastName: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isStaff = ["ADMIN", "ENGINEER", "SALES", "OPS"].includes(session.user.role);
  if (!isStaff && ticket.createdById !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (isStaff) {
    const denied = await assertAdminApiAcl(session.user.id, "tickets", "read");
    if (denied) return denied;
  }

  if (!isStaff) {
    return NextResponse.json({
      ...ticket,
      history: filterTicketHistoryForClient(ticket.history),
    });
  }

  return NextResponse.json(ticket);
}
