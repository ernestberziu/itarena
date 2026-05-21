import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { adminClientsListWhere } from "@/lib/admin-clients-list-where";
import { mapClientToAdminRow } from "@/lib/admin-clients-list-dto";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import { paginatedResponse, parseListPageParams } from "@/lib/admin-list-pagination";
import { sendAdminClientAccountUpdateEmail, sendPortalAccountInviteEmail } from "@/lib/portal-invite-email";


const clientListSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  passwordHash: true,
  isActive: true,
  emailVerified: true,
  role: true,
  createdAt: true,
  lastLoginAt: true,
  registrationCompanySnapshot: true,
  registeredCompanyId: true,
  company: { select: { id: true, name: true, tier: true, isApproved: true } },
  _count: { select: { tickets: true, orders: true } },
} as const;

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const allowed = ["ADMIN", "SALES"];
  if (!allowed.includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const denied = await assertAdminApiAcl(session.user.id, "clients", "read");
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const { page, pageSize, skip } = parseListPageParams(searchParams);
  const where = adminClientsListWhere({
    q: searchParams.get("q"),
    tier: searchParams.get("tier"),
    approved: searchParams.get("approved"),
    active: searchParams.get("active") ?? "all",
    affiliation: searchParams.get("affiliation"),
    portalAccess: searchParams.get("portalAccess"),
  });

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      select: clientListSelect,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    db.user.count({ where }),
  ]);

  const items = users.map(mapClientToAdminRow);
  return NextResponse.json(paginatedResponse(items, total, page, pageSize));
}

const postSchema = z
  .object({
    firstName: z.string().min(1).max(120),
    lastName: z.string().min(1).max(120),
    email: z.string().email().max(255).optional().nullable(),
    phone: z.string().max(40).optional().nullable(),
    companyId: z.string().min(1).optional().nullable(),
    language: z.enum(["sq", "en"]).optional().default("sq"),
    newPassword: z.string().min(8).max(128).optional(),
    generateTemporaryPassword: z.boolean().optional(),
    notifyCustomer: z.boolean().optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    const email = data.email?.trim();
    const hasEmail = Boolean(email);
    const wantsNotify = Boolean(data.notifyCustomer);
    const wantsGen = Boolean(data.generateTemporaryPassword);
    const hasPwd = Boolean(data.newPassword?.trim());

    if ((wantsNotify || wantsGen || hasPwd) && !hasEmail) {
      ctx.addIssue({
        code: "custom",
        message: "Email is required when setting a password or sending notification",
        path: ["email"],
      });
    }

    if (hasEmail && !hasPwd && !wantsGen && !wantsNotify) {
      ctx.addIssue({
        code: "custom",
        message: "Provide newPassword, generateTemporaryPassword, or notifyCustomer when email is set",
        path: ["newPassword"],
      });
    }
  });

function generateTemporaryPassword(): string {
  return randomBytes(14).toString("base64url").replace(/=/g, "").slice(0, 20);
}

function forbidIfNotStaff(role: string | undefined) {
  const allowed = ["ADMIN", "SALES"];
  if (!role || !allowed.includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const forbidden = forbidIfNotStaff(session.user.role);
  if (forbidden) return forbidden;
  const denied = await assertAdminApiAcl(session.user.id, "clients", "write");
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
  const emailRaw = data.email?.trim();
  const hasEmail = Boolean(emailRaw);
  const email = hasEmail ? emailRaw!.toLowerCase() : null;

  if (email) {
    const dup = await db.user.findFirst({ where: { email }, select: { id: true } });
    if (dup) return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }

  if (data.companyId) {
    const company = await db.company.findUnique({ where: { id: data.companyId }, select: { id: true } });
    if (!company) return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  let plainPassword: string | undefined;
  if (email) {
    if (data.newPassword?.trim()) plainPassword = data.newPassword.trim();
    else if (data.generateTemporaryPassword || data.notifyCustomer) plainPassword = generateTemporaryPassword();

    if (!plainPassword) {
      return NextResponse.json(
        { error: "Provide newPassword (min 8) or generateTemporaryPassword: true" },
        { status: 400 }
      );
    }
  }

  const user = await db.user.create({
    data: {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email,
      phone: data.phone?.trim() || null,
      passwordHash: plainPassword ? await bcrypt.hash(plainPassword, 12) : null,
      role: "CLIENT",
      language: data.language,
      companyId: data.companyId ?? null,
    },
    select: { id: true, email: true, firstName: true, lastName: true, language: true },
  });

  let credentialsEmailSent = false;
  if (data.notifyCustomer && email && plainPassword) {
    const mail = await sendPortalAccountInviteEmail({
      to: email,
      firstName: user.firstName,
      tempPassword: plainPassword,
      locale: user.language === "en" ? "en" : "sq",
    });
    credentialsEmailSent = mail.sent;
  }

  return NextResponse.json(
    {
      id: user.id,
      notifyEmailAttempted: Boolean(data.notifyCustomer && email),
      credentialsEmailSent,
      temporaryPassword: data.notifyCustomer && credentialsEmailSent ? undefined : plainPassword,
      pendingInvite: !email,
    },
    { status: 201 }
  );
}
