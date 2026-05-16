import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  service: z.string().optional(),
  message: z.string().min(10),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  // Log the contact request as an audit entry
  await db.auditLog.create({
    data: {
      action: "CONTACT_FORM",
      resource: "Contact",
      metadata: JSON.stringify(parsed.data),
    },
  });

  // TODO: Send email to info@itarena.al with contact details (e.g. SMTP / Nodemailer)

  return NextResponse.json({ success: true });
}
