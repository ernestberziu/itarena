import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const allowed = ["ADMIN", "SALES"];
  if (!allowed.includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const tier = searchParams.get("tier");
  const approved = searchParams.get("approved");

  const users = await db.user.findMany({
    where: {
      role: { in: ["CLIENT", "COMPANY_ADMIN"] },
      ...(q
        ? {
            OR: [
              { firstName: { contains: q } },
              { lastName: { contains: q } },
              { email: { contains: q } },
            ],
          }
        : {}),
    },
    include: {
      company: {
        select: { name: true, tier: true, isApproved: true },
      },
      _count: {
        select: { tickets: true, orders: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const filtered = users.filter((u) => {
    if (tier && u.company?.tier !== tier) return false;
    if (approved === "true" && !u.company?.isApproved) return false;
    if (approved === "false" && u.company?.isApproved) return false;
    return true;
  });

  return NextResponse.json(filtered);
}
