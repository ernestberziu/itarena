import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";

function forbidIfNotStaff(role: string | undefined) {
  const allowed = ["ADMIN", "SALES"];
  if (!role || !allowed.includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string; userId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const forbidden = forbidIfNotStaff(session.user.role);
  if (forbidden) return forbidden;
  const denied = await assertAdminApiAcl(session.user.id, "companies", "write");
  if (denied) return denied;

  const { id: companyId, userId } = await ctx.params;

  const user = await db.user.findFirst({
    where: {
      id: userId,
      companyId,
      role: { in: ["CLIENT", "COMPANY_ADMIN"] },
    },
    select: { id: true },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.user.update({
    where: { id: userId },
    data: { companyId: null },
  });

  return NextResponse.json({ ok: true });
}
