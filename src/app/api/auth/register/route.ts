import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { z } from "zod";
import { sendVerifyEmail } from "@/lib/email/transactional";
import {
  parseRegistrationCompanySnapshot,
  registrationCompanySnapshotSchema,
} from "@/lib/registration-company-snapshot";

const schema = z
  .object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    email: z.string().email(),
    phone: z.string().optional(),
    password: z.string().min(8),
    company: registrationCompanySnapshotSchema.optional(),
  })
  .strict();

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Të dhëna të pavlefshme" }, { status: 400 });
  }

  const { firstName, lastName, phone, password, company } = parsed.data;
  const email = parsed.data.email.trim().toLowerCase();

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Ky email është i regjistruar tashmë" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const verifyToken = randomBytes(32).toString("hex");
  const snapshot = company ? parseRegistrationCompanySnapshot(company) : null;

  const user = await db.user.create({
    data: {
      firstName,
      lastName,
      email,
      phone: phone?.trim() || null,
      passwordHash,
      role: "CLIENT",
      language: "sq",
      verifyToken,
      registrationCompanySnapshot: snapshot ?? undefined,
    },
  });

  void sendVerifyEmail({
    to: email,
    firstName,
    locale: "sq",
    verifyToken,
  }).catch((err) => console.error("[register] verify email", err));

  const { emitNotificationSafe } = await import("@/lib/notifications");
  emitNotificationSafe({
    type: "USER_REGISTERED",
    actorId: user.id,
    payload: {
      userId: user.id,
      actorName: `${firstName} ${lastName}`.trim(),
      subject: email,
    },
  });

  return NextResponse.json({
    success: true,
    companyDetailsSaved: Boolean(snapshot),
  });
}
