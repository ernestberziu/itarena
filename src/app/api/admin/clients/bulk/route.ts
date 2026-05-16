import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";

const CLIENT_ROLES = ["CLIENT", "COMPANY_ADMIN"] as const;

const bodySchema = z
  .object({
    userIds: z.array(z.string().min(1)).min(1).max(500),
    action: z.enum(["activate", "suspend"]),
  })
  .strict();

function forbidIfNotStaff(role: string | undefined) {
  const allowed = ["ADMIN", "SALES"];
  if (!role || !allowed.includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const forbidden = forbidIfNotStaff(session.user?.role);
  if (forbidden) return forbidden;
  const denied = await assertAdminApiAcl(session.user.id, "clients", "write");
  if (denied) return denied;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });
  }

  const { userIds, action } = parsed.data;
  const isActive = action === "activate";

  try {
    const result = await db.$transaction(async (tx) => {
      const update = await tx.user.updateMany({
        where: {
          id: { in: userIds },
          role: { in: [...CLIENT_ROLES] },
        },
        data: { isActive },
      });
      await tx.session.deleteMany({
        where: { userId: { in: userIds } },
      });
      return update.count;
    });

    return NextResponse.json({ ok: true, updatedCount: result });
  } catch {
    return NextResponse.json({ error: "Bulk update failed" }, { status: 500 });
  }
}
