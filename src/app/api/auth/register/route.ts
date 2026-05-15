import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8),
  type: z.enum(["individual", "business"]),
  companyName: z.string().optional(),
  vatNumber: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Të dhëna të pavlefshme" }, { status: 400 });
  }

  const { firstName, lastName, phone, password, type, companyName, vatNumber } = parsed.data;
  const email = parsed.data.email.trim().toLowerCase();

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Ky email është i regjistruar tashmë" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  if (type === "business" && companyName) {
    const company = await db.company.create({
      data: {
        name: companyName,
        vatNumber: vatNumber || null,
        tier: "B2B",
        isApproved: false,
      },
    });

    await db.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        passwordHash,
        role: "COMPANY_ADMIN",
        companyId: company.id,
        language: "sq",
      },
    });

    // TODO: Send approval notification to admin
    return NextResponse.json({ success: true, requiresApproval: true });
  }

  await db.user.create({
    data: {
      firstName,
      lastName,
      email,
      phone,
      passwordHash,
      role: "CLIENT",
      language: "sq",
    },
  });

  // TODO: Send email verification
  return NextResponse.json({ success: true });
}
