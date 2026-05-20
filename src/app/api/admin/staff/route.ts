import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import { STAFF_ROLES } from "@/types/domain";
import { activeStaffWhere } from "@/lib/staff/active-staff-where";

const postSchema = z
  .object({
    firstName: z.string().min(1).max(120),
    lastName: z.string().min(1).max(120),
    email: z.string().email().max(255),
    role: z.enum(["ADMIN", "ENGINEER", "SALES", "OPS", "PARTNER"]),
    isActive: z.boolean().optional().default(true),
    newPassword: z.string().min(8).max(128).optional(),
    generateTemporaryPassword: z.boolean().optional(),
  })
  .strict();

function generateTemporaryPassword(): string {
  return randomBytes(14).toString("base64url").replace(/=/g, "").slice(0, 20);
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await assertAdminApiAcl(session.user.id, "staff", "read");
  if (denied) return denied;

  const staff = await db.user.findMany({
    where: activeStaffWhere(),
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
      _count: {
        select: {
          assignedTickets: true,
        },
      },
    },
    orderBy: { role: "asc" },
  });

  return NextResponse.json(staff);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const denied = await assertAdminApiAcl(session.user.id, "staff", "write");
  if (denied) return denied;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  const trimmedPassword =
    typeof data.newPassword === "string" && data.newPassword.trim().length > 0
      ? data.newPassword.trim()
      : undefined;

  let plainPassword: string | undefined;
  if (trimmedPassword) {
    plainPassword = trimmedPassword;
  } else if (data.generateTemporaryPassword) {
    plainPassword = generateTemporaryPassword();
  }

  if (!plainPassword) {
    return NextResponse.json(
      { error: "Provide newPassword (min 8 characters) or generateTemporaryPassword: true" },
      { status: 400 }
    );
  }

  const email = data.email.trim().toLowerCase();
  const dup = await db.user.findFirst({ where: { email }, select: { id: true } });
  if (dup) {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(plainPassword, 10);

  try {
    const user = await db.user.create({
      data: {
        email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        isActive: data.isActive,
        passwordHash,
        language: "sq",
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
    return NextResponse.json({
      ok: true,
      user,
      temporaryPassword: data.generateTemporaryPassword && !trimmedPassword ? plainPassword : undefined,
    });
  } catch {
    return NextResponse.json({ error: "Create failed" }, { status: 500 });
  }
}
