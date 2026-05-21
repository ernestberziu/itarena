import {  NextRequest, NextResponse  } from "next/server";
import { apiErr } from "@/lib/i18n/err";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";

const postSchema = z
  .object({
    userId: z.string().min(1),
  })
  .strict();

function forbidIfNotStaff(role: string | undefined) {
  const allowed = ["ADMIN", "SALES"];
  if (!role || !allowed.includes(role)) {
    return apiErr("sq", "forbidden", 403);
  }
  return null;
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return apiErr(req, "unauthorized", 401);
  const forbidden = forbidIfNotStaff(session.user.role);
  if (forbidden) return forbidden;
  const denied = await assertAdminApiAcl(session.user.id, "companies", "write");
  if (denied) return denied;

  const { id: companyId } = await ctx.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiErr(req, "invalidJson", 400);
  }

  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return apiErr(req, "invalidBody", 400, { details: parsed.error.flatten() });
  }

  const company = await db.company.findUnique({ where: { id: companyId }, select: { id: true } });
  if (!company) return apiErr(req, "notFound", 404);

  const user = await db.user.findFirst({
    where: { id: parsed.data.userId, role: { in: ["CLIENT", "COMPANY_ADMIN"] } },
    select: { id: true },
  });
  if (!user) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  await db.user.update({
    where: { id: user.id },
    data: { companyId },
  });

  const { emitNotificationSafe } = await import("@/lib/notifications");
  emitNotificationSafe({
    type: "COMPANY_MEMBER_ADDED",
    actorId: session.user.id,
    payload: { userId: user.id, companyId },
  });

  return NextResponse.json({ ok: true });
}
