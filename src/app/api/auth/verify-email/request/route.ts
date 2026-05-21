import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { pickLocale } from "@/lib/email/brand";
import { sendVerifyEmail } from "@/lib/email/transactional";

const schema = z.object({
  email: z.string().email().optional(),
  locale: z.enum(["sq", "en"]).optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);

  let user: {
    id: string;
    email: string | null;
    firstName: string;
    language: string;
    emailVerified: Date | null;
  } | null = null;

  if (session?.user?.id) {
    user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, firstName: true, language: true, emailVerified: true },
    });
  } else if (parsed.success && parsed.data.email) {
    const email = parsed.data.email.trim().toLowerCase();
    user = await db.user.findUnique({
      where: { email },
      select: { id: true, email: true, firstName: true, language: true, emailVerified: true },
    });
  }

  if (!user?.email) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (user.emailVerified) {
    return NextResponse.json({ ok: true, alreadyVerified: true });
  }

  const verifyToken = randomBytes(32).toString("hex");
  await db.user.update({
    where: { id: user.id },
    data: { verifyToken },
  });

  const locale = pickLocale(parsed.success ? parsed.data.locale : user.language);
  await sendVerifyEmail({
    to: user.email,
    firstName: user.firstName,
    locale,
    verifyToken,
  });

  return NextResponse.json({ ok: true });
}
