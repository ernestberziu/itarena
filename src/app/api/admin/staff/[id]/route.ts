import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import { adminAclOverlaySchema } from "@/lib/admin-acl/schema";
import { STAFF_ROLES } from "@/types/domain";
import { activeStaffWhere } from "@/lib/staff/active-staff-where";
import { removeStaffMember } from "@/lib/staff/remove-staff-member";
import { sendStaffAccountUpdateEmail } from "@/lib/email/transactional";
import { pickLocale } from "@/lib/email/brand";

const staffRoleSchema = z.enum(["ADMIN", "ENGINEER", "SALES", "OPS", "PARTNER"]);

const patchSchema = z
  .object({
    isActive: z.boolean().optional(),
    firstName: z.string().min(1).max(120).optional(),
    lastName: z.string().min(1).max(120).optional(),
    email: z.string().email().max(255).optional(),
    role: staffRoleSchema.optional(),
    newPassword: z.string().min(8).max(128).optional(),
    generateTemporaryPassword: z.boolean().optional(),
    notifyCustomer: z.boolean().optional(),
    adminAclJson: z.union([adminAclOverlaySchema, z.null()]).optional(),
  })
  .strict();

function generateTemporaryPassword(): string {
  return randomBytes(14).toString("base64url").replace(/=/g, "").slice(0, 20);
}

async function countOtherActiveAdmins(excludeUserId: string): Promise<number> {
  return db.user.count({
    where: { role: "ADMIN", isActive: true, id: { not: excludeUserId } },
  });
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await assertAdminApiAcl(session.user.id, "staff", "read");
  if (denied) return denied;

  const { id } = await ctx.params;

  const user = await db.user.findFirst({
    where: { id, ...activeStaffWhere() },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      isActive: true,
      language: true,
      lastLoginAt: true,
      createdAt: true,
      emailVerified: true,
      adminAclJson: true,
      _count: { select: { assignedTickets: true } },
    },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(user);
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await assertAdminApiAcl(session.user.id, "staff", "write");
  if (denied) return denied;

  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });
  }

  const patch = parsed.data;

  const current = await db.user.findFirst({
    where: { id, ...activeStaffWhere() },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
    },
  });
  if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (patch.role === "ADMIN" && current.role !== "ADMIN" && session.user.id === id) {
    return NextResponse.json({ error: "Cannot promote yourself to admin via this endpoint" }, { status: 403 });
  }

  const roleChanging = patch.role !== undefined && patch.role !== current.role;
  if (roleChanging && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (current.role === "ADMIN") {
    const wouldRemoveAdmin =
      (patch.role !== undefined && patch.role !== "ADMIN") ||
      (patch.isActive !== undefined && patch.isActive === false);
    if (wouldRemoveAdmin) {
      const others = await countOtherActiveAdmins(id);
      if (others === 0) {
        return NextResponse.json(
          { error: "Cannot remove or demote the last active administrator." },
          { status: 409 }
        );
      }
    }
  }

  if (patch.adminAclJson !== undefined && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const trimmedPassword =
    typeof patch.newPassword === "string" && patch.newPassword.trim().length > 0
      ? patch.newPassword.trim()
      : undefined;

  let plainPassword: string | undefined;
  if (trimmedPassword) {
    plainPassword = trimmedPassword;
  } else if (patch.generateTemporaryPassword) {
    plainPassword = generateTemporaryPassword();
  }

  const currentEmailNorm = current.email?.trim().toLowerCase() ?? "";
  const nextEmail =
    patch.email !== undefined ? patch.email.trim().toLowerCase() : currentEmailNorm;
  const emailChanged =
    patch.email !== undefined && nextEmail !== currentEmailNorm;

  if (patch.email !== undefined) {
    const dup = await db.user.findFirst({
      where: { email: nextEmail, NOT: { id } },
      select: { id: true },
    });
    if (dup) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }
  }

  const prismaData: {
    firstName?: string;
    lastName?: string;
    email?: string;
    isActive?: boolean;
    role?: string;
    passwordHash?: string;
    emailVerified?: null;
    adminAclJson?: Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue;
  } = {};

  if (patch.firstName !== undefined) prismaData.firstName = patch.firstName;
  if (patch.lastName !== undefined) prismaData.lastName = patch.lastName;
  if (patch.email !== undefined) {
    prismaData.email = nextEmail;
    prismaData.emailVerified = null;
  }
  if (patch.isActive !== undefined) prismaData.isActive = patch.isActive;
  if (patch.role !== undefined) prismaData.role = patch.role;
  if (plainPassword) {
    prismaData.passwordHash = await bcrypt.hash(plainPassword, 10);
  }
  if (patch.adminAclJson !== undefined) {
    prismaData.adminAclJson =
      patch.adminAclJson === null
        ? Prisma.DbNull
        : (patch.adminAclJson as Prisma.InputJsonValue);
  }

  const hasPrismaUpdates = Object.keys(prismaData).length > 0;
  if (!hasPrismaUpdates) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const shouldClearSessions = Boolean(plainPassword || emailChanged);

  const aclChanged = patch.adminAclJson !== undefined;

  try {
    await db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id },
        data: prismaData,
      });
      if (shouldClearSessions) {
        await tx.session.deleteMany({ where: { userId: id } });
      }
    });
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  if (aclChanged) {
    const { emitNotificationSafe } = await import("@/lib/notifications");
    emitNotificationSafe({
      type: "STAFF_ACL_CHANGED",
      actorId: session.user.id,
      payload: { userId: id },
    });
  }

  let credentialsEmailSent = false;
  if (patch.notifyCustomer && plainPassword && nextEmail) {
    const updated = await db.user.findUnique({
      where: { id },
      select: { firstName: true, language: true },
    });
    const mail = await sendStaffAccountUpdateEmail({
      to: nextEmail,
      firstName: patch.firstName ?? updated?.firstName ?? "User",
      mailLocale: pickLocale(updated?.language),
      temporaryPassword: plainPassword,
      signInEmail: nextEmail,
      emailChanged,
      previousEmail: emailChanged ? (current.email ?? undefined) : undefined,
    });
    credentialsEmailSent = mail.sent;
  }

  return NextResponse.json(
    patch.notifyCustomer
      ? {
          ok: true,
          notifyEmailAttempted: true,
          credentialsEmailSent,
          temporaryPassword: credentialsEmailSent ? undefined : plainPassword,
        }
      : plainPassword && patch.generateTemporaryPassword && !trimmedPassword
        ? { ok: true, temporaryPassword: plainPassword }
        : { ok: true }
  );
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await assertAdminApiAcl(session.user.id, "staff", "write");
  if (denied) return denied;

  const { id } = await ctx.params;

  if (session.user.id === id) {
    return NextResponse.json({ error: "You cannot remove your own account." }, { status: 403 });
  }

  const current = await db.user.findFirst({
    where: { id, ...activeStaffWhere() },
    select: { id: true, role: true, isActive: true },
  });
  if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (current.role === "ADMIN" && current.isActive) {
    const others = await countOtherActiveAdmins(id);
    if (others === 0) {
      return NextResponse.json(
        { error: "Cannot remove the last active administrator." },
        { status: 409 }
      );
    }
  }

  try {
    await db.$transaction(async (tx) => {
      await removeStaffMember(id, tx);
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Remove failed" }, { status: 500 });
  }

  const { emitNotificationSafe } = await import("@/lib/notifications");
  emitNotificationSafe({
    type: "STAFF_REMOVED",
    actorId: session.user.id,
    payload: { userId: id },
  });

  return NextResponse.json({ ok: true });
}
