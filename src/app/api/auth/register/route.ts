import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { z } from "zod";
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
  const snapshot = company ? parseRegistrationCompanySnapshot(company) : null;

  await db.user.create({
    data: {
      firstName,
      lastName,
      email,
      phone: phone?.trim() || null,
      passwordHash,
      role: "CLIENT",
      language: "sq",
      registrationCompanySnapshot: snapshot ?? undefined,
    },
  });

  return NextResponse.json({
    success: true,
    companyDetailsSaved: Boolean(snapshot),
  });
}
