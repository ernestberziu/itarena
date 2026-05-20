import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import { STAFF_ROLES } from "@/types/domain";

const patchSchema = z
  .object({
    phone: z.union([z.string().max(32), z.null()]).optional(),
    currentPassword: z.string().min(1).max(128).optional(),
    newPassword: z.string().min(8).max(128).optional(),
    confirmPassword: z.string().min(8).max(128).optional(),
  })
  .superRefine((data, ctx) => {
    const changingPassword =
      Boolean(data.newPassword?.trim()) ||
      Boolean(data.confirmPassword?.trim()) ||
      Boolean(data.currentPassword?.trim());

    if (changingPassword) {
      if (!data.currentPassword?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Current password is required",
          path: ["currentPassword"],
        });
      }
      if (!data.newPassword?.trim() || data.newPassword.trim().length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "New password must be at least 8 characters",
          path: ["newPassword"],
        });
      }
      if (data.newPassword !== data.confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Passwords do not match",
          path: ["confirmPassword"],
        });
      }
    }

    if (data.phone === undefined && !changingPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "No fields to update",
      });
    }
  });

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const denied = await assertAdminApiAcl(session.user.id, "profile", "write");
  if (denied) return denied;

  if (!STAFF_ROLES.includes(session.user.role as (typeof STAFF_ROLES)[number])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { phone, currentPassword, newPassword } = parsed.data;
  const changingPassword = Boolean(newPassword?.trim() && currentPassword?.trim());

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, passwordHash: true, phone: true },
  });
  if (!user?.passwordHash) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updateData: { phone?: string | null; passwordHash?: string } = {};
  let clearSessions = false;

  if (phone !== undefined) {
    const normalized = phone === null ? null : phone.trim() || null;
    updateData.phone = normalized;
  }

  if (changingPassword && newPassword && currentPassword) {
    const currentOk = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!currentOk) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 403 });
    }

    const sameAsOld = await bcrypt.compare(newPassword.trim(), user.passwordHash);
    if (sameAsOld) {
      return NextResponse.json(
        { error: "New password must be different from the current password" },
        { status: 400 }
      );
    }

    updateData.passwordHash = await bcrypt.hash(newPassword.trim(), 10);
    clearSessions = true;
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  try {
    await db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: updateData,
      });
      if (clearSessions) {
        await tx.session.deleteMany({ where: { userId: user.id } });
      }
    });
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, passwordChanged: clearSessions });
}
