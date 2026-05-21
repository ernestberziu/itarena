import {  NextRequest, NextResponse  } from "next/server";
import { apiErr } from "@/lib/i18n/err";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { generateTicketNumber } from "@/lib/utils";
import {
  WORKING_HOURS_PER_DAY,
  MAX_RESOLUTION_HOURS,
  normalizeTicketEstimate,
  slaDeadlineFromEstimate,
} from "@/lib/ticket-estimate";
import { STAFF_ROLES } from "@/types/domain";
import { sendPortalAccountInviteEmail } from "@/lib/portal-invite-email";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import { canAccessProject } from "@/lib/projects";
import { TICKET_PROJECT_STAFF_CONFLICT } from "@/lib/ticket-project";
import { emitNotificationSafe } from "@/lib/notifications";
import { actorDisplayName } from "@/lib/notifications/helpers";

const baseSchema = z
  .object({
    title: z.string().min(5),
    division: z.string().min(1),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
    description: z.string().min(20),
    estimatedDays: z.coerce.number().int().min(0).max(62).optional(),
    estimatedHours: z.coerce.number().int().min(0).max(500).optional(),
    projectId: z.string().cuid().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    const d = data.estimatedDays ?? 0;
    const h = data.estimatedHours ?? 0;
    const sum = d * WORKING_HOURS_PER_DAY + h;
    if (sum > MAX_RESOLUTION_HOURS) {
      ctx.addIssue({
        code: "custom",
        message: `Combined estimate must not exceed ${MAX_RESOLUTION_HOURS} hours (${WORKING_HOURS_PER_DAY}h per calendar day + additional hours).`,
        path: ["estimatedDays"],
      });
    }
  });

const inviteRequesterSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(2).max(80),
  lastName: z.string().min(2).max(80),
});

const staffExtrasSchema = z
  .object({
    requesterUserId: z.string().cuid().optional(),
    externalRequesterName: z.string().min(2).max(200).optional(),
    inviteRequester: inviteRequesterSchema.optional(),
    assignedToId: z.string().cuid().optional(),
  })
  .superRefine((data, ctx) => {
    const modes = [
      data.requesterUserId,
      data.externalRequesterName,
      data.inviteRequester,
    ].filter(Boolean);
    if (modes.length > 1) {
      ctx.addIssue({
        code: "custom",
        message: "Use only one of requesterUserId, externalRequesterName, or inviteRequester",
        path: ["requesterUserId"],
      });
    }
  });

const CLIENT_ROLES = ["CLIENT", "COMPANY_ADMIN"] as const;

function generateTempPassword(): string {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(14);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < 14; i++) out += chars[bytes[i]! % chars.length];
  return out;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiErr(req, "unauthorized", 401);

  const body = await req.json();
  const parsedBase = baseSchema.safeParse(body);
  if (!parsedBase.success) {
    return NextResponse.json({ error: "Invalid data", details: parsedBase.error.flatten() }, { status: 400 });
  }

  const isStaff = STAFF_ROLES.includes(session.user.role as (typeof STAFF_ROLES)[number]);

  if (isStaff) {
    const denied = await assertAdminApiAcl(session.user.id, "tickets", "write");
    if (denied) return denied;
  }

  let requesterUserId: string | undefined;
  let externalRequesterName: string | undefined;
  let inviteRequester: z.infer<typeof inviteRequesterSchema> | undefined;
  let assignedToId: string | undefined;

  if (isStaff) {
    const parsedExtra = staffExtrasSchema.safeParse(body);
    if (!parsedExtra.success) {
      return NextResponse.json(
        { error: "Invalid staff fields", details: parsedExtra.error.flatten() },
        { status: 400 }
      );
    }
    requesterUserId = parsedExtra.data.requesterUserId;
    externalRequesterName = parsedExtra.data.externalRequesterName?.trim() || undefined;
    inviteRequester = parsedExtra.data.inviteRequester;
    assignedToId = parsedExtra.data.assignedToId;
  } else {
    if (
      body.requesterUserId != null ||
      body.externalRequesterName != null ||
      body.inviteRequester != null ||
      body.assignedToId != null
    ) {
      return apiErr(req, "forbidden", 403);
    }
  }

  const { title, division, priority, description, estimatedDays, estimatedHours, projectId } =
    parsedBase.data;

  let resolvedProjectId: string | null = projectId ?? null;
  if (resolvedProjectId) {
    const ok = await canAccessProject(session.user.id, resolvedProjectId, "write");
    if (!ok) {
      return NextResponse.json({ error: "Invalid project" }, { status: 400 });
    }
  }
  const estimate = normalizeTicketEstimate(estimatedDays, estimatedHours);
  const createdAtForSla = new Date();
  const slaDeadline = slaDeadlineFromEstimate(createdAtForSla, estimate.resolutionHours);

  let assigneeId: string | null = assignedToId ?? null;
  if (resolvedProjectId && assigneeId) {
    return NextResponse.json({ error: TICKET_PROJECT_STAFF_CONFLICT }, { status: 400 });
  }
  if (assigneeId) {
    const assignee = await db.user.findUnique({
      where: { id: assigneeId },
      select: { id: true, role: true, isActive: true, deletedAt: true },
    });
    if (
      !assignee ||
      !assignee.isActive ||
      assignee.deletedAt ||
      !STAFF_ROLES.includes(assignee.role as (typeof STAFF_ROLES)[number])
    ) {
      return NextResponse.json({ error: "Invalid assignee" }, { status: 400 });
    }
  }

  const initialStatus = assigneeId ? "ASSIGNED" : "OPEN";

  let createdById = session.user.id;
  let companyId: string | undefined = session.user.companyId ?? undefined;
  let externalName: string | undefined = undefined;
  let inviteTempPasswordPlain: string | undefined;

  if (isStaff && inviteRequester) {
    const email = inviteRequester.email.trim().toLowerCase();
    const existing = await db.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) {
      return NextResponse.json(
        { error: "User with this email already exists. Search them under Portal user." },
        { status: 409 }
      );
    }
    inviteTempPasswordPlain = generateTempPassword();
    const passwordHash = await bcrypt.hash(inviteTempPasswordPlain, 12);
    const firstName = inviteRequester.firstName.trim();
    const lastName = inviteRequester.lastName.trim();

    const ticket = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          firstName,
          lastName,
          passwordHash,
          role: "CLIENT",
          language: session.user.language === "en" ? "en" : "sq",
        },
      });

      const t = await tx.ticket.create({
        data: {
          number: generateTicketNumber(),
          title,
          division,
          priority,
          description,
          slaDeadline,
          status: initialStatus,
          createdById: user.id,
          companyId: null,
          assignedToId: assigneeId,
          estimatedDays: estimate.estimatedDays,
          estimatedHours: estimate.estimatedHours,
          externalRequesterName: null,
          projectId: resolvedProjectId,
        },
      });

      await tx.ticketHistory.create({
        data: {
          ticketId: t.id,
          changedById: session.user.id,
          field: "status",
          oldValue: null,
          newValue: initialStatus,
        },
      });

      if (assigneeId) {
        await tx.ticketHistory.create({
          data: {
            ticketId: t.id,
            changedById: session.user.id,
            field: "assignedTo",
            oldValue: null,
            newValue: assigneeId,
          },
        });
      }

      return t;
    });

    await db.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "CREATE",
        resource: "Ticket",
        resourceId: ticket.id,
        ip: req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? undefined,
      },
    });

    const actorName = await actorDisplayName(session.user.id);
    emitNotificationSafe({
      type: "TICKET_CREATED",
      actorId: session.user.id,
      entity: { type: "ticket", id: ticket.id },
      payload: {
        ticketId: ticket.id,
        ticketNumber: ticket.number,
        title: ticket.title,
        actorName,
      },
    });

    const locale = session.user.language === "en" ? "en" : "sq";
    const emailResult = await sendPortalAccountInviteEmail({
      to: email,
      firstName,
      tempPassword: inviteTempPasswordPlain,
      locale,
      ticketNumber: ticket.number,
    });

    return NextResponse.json(
      {
        id: ticket.id,
        number: ticket.number,
        invite: emailResult.sent
          ? { emailSent: true }
          : { emailSent: false, tempPassword: inviteTempPasswordPlain },
      },
      { status: 201 }
    );
  }

  if (isStaff && requesterUserId) {
    const requester = await db.user.findUnique({
      where: { id: requesterUserId },
      select: { id: true, role: true, companyId: true },
    });
    if (!requester || !CLIENT_ROLES.includes(requester.role as (typeof CLIENT_ROLES)[number])) {
      return NextResponse.json({ error: "Invalid requester user" }, { status: 400 });
    }
    createdById = requester.id;
    companyId = requester.companyId ?? undefined;
  } else if (isStaff && externalRequesterName) {
    externalName = externalRequesterName;
    companyId = session.user.companyId ?? undefined;
  }

  const ticket = await db.ticket.create({
    data: {
      number: generateTicketNumber(),
      title,
      division,
      priority,
      description,
      slaDeadline,
      status: initialStatus,
      createdById,
      companyId,
      assignedToId: assigneeId,
      estimatedDays: estimate.estimatedDays,
      estimatedHours: estimate.estimatedHours,
      externalRequesterName: externalName ?? null,
      projectId: resolvedProjectId,
    },
  });

  await db.ticketHistory.create({
    data: {
      ticketId: ticket.id,
      changedById: session.user.id,
      field: "status",
      oldValue: null,
      newValue: initialStatus,
    },
  });

  if (assigneeId) {
    await db.ticketHistory.create({
      data: {
        ticketId: ticket.id,
        changedById: session.user.id,
        field: "assignedTo",
        oldValue: null,
        newValue: assigneeId,
      },
    });
  }

  await db.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "CREATE",
      resource: "Ticket",
      resourceId: ticket.id,
      ip: req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? undefined,
    },
  });

  const actorName = await actorDisplayName(session.user.id);
  emitNotificationSafe({
    type: "TICKET_CREATED",
    actorId: session.user.id,
    entity: { type: "ticket", id: ticket.id },
    payload: {
      ticketId: ticket.id,
      ticketNumber: ticket.number,
      title: ticket.title,
      actorName,
    },
  });

  return NextResponse.json({ id: ticket.id, number: ticket.number }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiErr(req, "unauthorized", 401);

  const isStaff = STAFF_ROLES.includes(session.user.role as (typeof STAFF_ROLES)[number]);

  if (isStaff) {
    const denied = await assertAdminApiAcl(session.user.id, "tickets", "read");
    if (denied) return denied;
  }

  const tickets = await db.ticket.findMany({
    where: isStaff ? {} : { createdById: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      createdBy: { select: { firstName: true, lastName: true } },
      assignedTo: { select: { firstName: true, lastName: true } },
    },
  });

  return NextResponse.json(tickets);
}
