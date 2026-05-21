import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { token, password } = parsed.data;

  const user = await db.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: { gt: new Date() },
    },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await db.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });
    await tx.session.deleteMany({ where: { userId: user.id } });
  });

  const { emitNotificationSafe } = await import("@/lib/notifications");
  emitNotificationSafe({
    type: "PASSWORD_CHANGED",
    actorId: user.id,
    payload: { userId: user.id },
    excludeActor: false,
  });

  return NextResponse.json({ ok: true });
}
