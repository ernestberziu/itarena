import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { pickLocale } from "@/lib/email/brand";
import { sendResetPasswordEmail } from "@/lib/email/transactional";

const schema = z.object({
  email: z.string().email(),
  locale: z.enum(["sq", "en"]).optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const locale = pickLocale(parsed.data.locale);

  const user = await db.user.findUnique({
    where: { email },
    select: { id: true, firstName: true, isActive: true, deletedAt: true },
  });

  if (!user || !user.isActive || user.deletedAt) {
    return NextResponse.json({ ok: true });
  }

  const resetToken = randomBytes(32).toString("hex");
  const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await db.user.update({
    where: { id: user.id },
    data: { resetToken, resetTokenExpiry },
  });

  await sendResetPasswordEmail({
    to: email,
    firstName: user.firstName,
    locale,
    resetToken,
  });

  return NextResponse.json({ ok: true });
}
