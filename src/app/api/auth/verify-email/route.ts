import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")?.trim();
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const user = await db.user.findFirst({
    where: { verifyToken: token },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }

  await db.user.update({
    where: { id: user.id },
    data: {
      emailVerified: new Date(),
      verifyToken: null,
    },
  });

  return NextResponse.json({ ok: true });
}
