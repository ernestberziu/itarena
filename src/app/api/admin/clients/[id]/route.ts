import { randomBytes } from "node:crypto";
import {  NextRequest, NextResponse  } from "next/server";
import { apiErr } from "@/lib/i18n/err";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import { sendAdminClientAccountUpdateEmail, sendPortalAccountInviteEmail } from "@/lib/portal-invite-email";

const CLIENT_ROLES = ["CLIENT", "COMPANY_ADMIN"] as const;

const patchSchema = z
  .object({
    isActive: z.boolean().optional(),
    firstName: z.string().min(1).max(120).optional(),
    lastName: z.string().min(1).max(120).optional(),
    email: z.string().email().max(255).optional(),
    companyId: z.string().min(1).nullable().optional(),
    newPassword: z.string().min(8).max(128).optional(),
    generateTemporaryPassword: z.boolean().optional(),
    notifyCustomer: z.boolean().optional(),
  })
  .strict();

function forbidIfNotStaff(role: string | undefined) {
  const allowed = ["ADMIN", "SALES"];
  if (!role || !allowed.includes(role)) {
    return apiErr("sq", "forbidden", 403);
  }
  return null;
}

function generateTemporaryPassword(): string {
  return randomBytes(14).toString("base64url").replace(/=/g, "").slice(0, 20);
}

function mailLocale(lang: string | null | undefined): "sq" | "en" {
  return lang === "en" ? "en" : "sq";
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return apiErr(req, "unauthorized", 401);
  const forbidden = forbidIfNotStaff(session.user?.role);
  if (forbidden) return forbidden;
  const denied = await assertAdminApiAcl(session.user.id, "clients", "write");
  if (denied) return denied;

  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiErr(req, "invalidJson", 400);
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return apiErr(req, "invalidBody", 400, { details: parsed.error.flatten() });
  }

  const patch = parsed.data;

  const current = await db.user.findFirst({
    where: { id, role: { in: [...CLIENT_ROLES] } },
    select: { id: true, email: true, passwordHash: true, firstName: true, lastName: true, language: true },
  });
  if (!current) return apiErr(req, "notFound", 404);

  const isFirstInvite = !current.email || !current.passwordHash;

  const trimmedPassword =
    typeof patch.newPassword === "string" && patch.newPassword.trim().length > 0
      ? patch.newPassword.trim()
      : undefined;

  let plainPassword: string | undefined;
  if (trimmedPassword) {
    plainPassword = trimmedPassword;
  } else if (patch.generateTemporaryPassword) {
    plainPassword = generateTemporaryPassword();
  } else if (patch.notifyCustomer) {
    plainPassword = generateTemporaryPassword();
  }

  const currentEmailNorm = current.email?.trim().toLowerCase() ?? null;
  const nextEmail =
    patch.email !== undefined ? patch.email.trim().toLowerCase() : currentEmailNorm;
  const emailChanged =
    patch.email !== undefined && nextEmail !== currentEmailNorm;

  if (patch.email !== undefined) {
    const dup = await db.user.findFirst({
      where: { email: nextEmail!, NOT: { id } },
      select: { id: true },
    });
    if (dup) {
      return apiErr(req, "emailInUse", 409);
    }
  }

  const prismaData: {
    firstName?: string;
    lastName?: string;
    email?: string;
    isActive?: boolean;
    companyId?: string | null;
    passwordHash?: string;
    emailVerified?: null;
  } = {};

  if (patch.firstName !== undefined) prismaData.firstName = patch.firstName;
  if (patch.lastName !== undefined) prismaData.lastName = patch.lastName;
  if (patch.email !== undefined) {
    prismaData.email = nextEmail!;
    prismaData.emailVerified = null;
  }
  if (patch.isActive !== undefined) prismaData.isActive = patch.isActive;

  if (patch.companyId !== undefined) {
    if (patch.companyId === null) {
      prismaData.companyId = null;
    } else {
      const company = await db.company.findUnique({ where: { id: patch.companyId }, select: { id: true } });
      if (!company) return apiErr(req, "notFound", 404);
      prismaData.companyId = patch.companyId;
    }
  }

  if (plainPassword) {
    prismaData.passwordHash = await bcrypt.hash(plainPassword, 10);
  }

  const hasPrismaUpdates = Object.keys(prismaData).length > 0;
  if (!hasPrismaUpdates && !patch.notifyCustomer) {
    return apiErr(req, "noFieldsToUpdate", 400);
  }

  const shouldClearSessions = Boolean(plainPassword || emailChanged);

  try {
    await db.$transaction(async (tx) => {
      if (hasPrismaUpdates) {
        await tx.user.update({
          where: { id },
          data: prismaData,
        });
      }
      if (shouldClearSessions) {
        await tx.session.deleteMany({ where: { userId: id } });
      }
    });
  } catch {
    return apiErr(req, "updateFailed", 500);
  }

  let credentialsEmailSent = false;
  if (patch.notifyCustomer && plainPassword && nextEmail) {
    if (isFirstInvite || emailChanged) {
      const mail = await sendPortalAccountInviteEmail({
        to: nextEmail,
        firstName: patch.firstName ?? current.firstName,
        tempPassword: plainPassword,
        locale: mailLocale(current.language),
      });
      credentialsEmailSent = mail.sent;
    } else {
      const mail = await sendAdminClientAccountUpdateEmail({
        to: nextEmail,
        firstName: patch.firstName ?? current.firstName,
        mailLocale: mailLocale(current.language),
        temporaryPassword: plainPassword,
        signInEmail: nextEmail,
        emailChanged,
        previousEmail: emailChanged ? (current.email ?? undefined) : undefined,
      });
      credentialsEmailSent = mail.sent;
    }
  }

  if (hasPrismaUpdates) {
    const { emitNotificationSafe } = await import("@/lib/notifications");
    emitNotificationSafe({
      type: "CLIENT_ACCOUNT_UPDATED",
      actorId: session.user.id,
      payload: { userId: id },
      skipEmail: patch.notifyCustomer && credentialsEmailSent,
    });
  }

  return NextResponse.json(
    patch.notifyCustomer
      ? {
          ok: true,
          notifyEmailAttempted: true,
          credentialsEmailSent,
          temporaryPassword: credentialsEmailSent ? undefined : plainPassword,
        }
      : plainPassword
        ? { ok: true, temporaryPassword: plainPassword }
        : { ok: true }
  );
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return apiErr(_req, "unauthorized", 401);
  const forbidden = forbidIfNotStaff(session.user?.role);
  if (forbidden) return forbidden;
  const denied = await assertAdminApiAcl(session.user.id, "clients", "write");
  if (denied) return denied;

  const { id } = await ctx.params;
  const existing = await db.user.findFirst({
    where: { id, role: { in: [...CLIENT_ROLES] } },
    select: { id: true },
  });
  if (!existing) return apiErr(_req, "notFound", 404);

  const [orders, ticketsAsCreator, ticketsAsAssignee, quotes, comments, histories, audits] =
    await Promise.all([
      db.order.count({ where: { userId: id } }),
      db.ticket.count({ where: { createdById: id } }),
      db.ticket.count({ where: { assignedToId: id } }),
      db.quote.count({ where: { requestedById: id } }),
      db.ticketComment.count({ where: { authorId: id } }),
      db.ticketHistory.count({ where: { changedById: id } }),
      db.auditLog.count({ where: { actorId: id } }),
    ]);

  const blocked =
    orders +
    ticketsAsCreator +
    ticketsAsAssignee +
    quotes +
    comments +
    histories +
    audits;
  if (blocked > 0) {
    return NextResponse.json(
      {
        error:
          "Cannot delete this user while orders, tickets, quotes, comments, history, or audit records still reference the account. Suspend the account instead.",
      },
      { status: 409 }
    );
  }

  try {
    await db.$transaction([
      db.session.deleteMany({ where: { userId: id } }),
      db.account.deleteMany({ where: { userId: id } }),
      db.notification.deleteMany({ where: { userId: id } }),
      db.user.delete({ where: { id } }),
    ]);
  } catch (e) {
    console.error(e);
    return apiErr(_req, "deleteFailed", 500);
  }

  return NextResponse.json({ ok: true });
}
