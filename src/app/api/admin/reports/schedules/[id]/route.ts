import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";

const patchSchema = z.object({
  cron: z.string().min(5).max(64).optional(),
  recipients: z.array(z.string().email()).min(1).optional(),
  enabled: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") {
    const denied = await assertAdminApiAcl(session.user.id, "reports", "write");
    if (denied) return denied;
  }

  const { id } = await ctx.params;
  const parsed = patchSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const schedule = await db.reportSchedule.update({
    where: { id },
    data: {
      ...(parsed.data.cron !== undefined ? { cron: parsed.data.cron } : {}),
      ...(parsed.data.recipients !== undefined
        ? { recipients: JSON.stringify(parsed.data.recipients) }
        : {}),
      ...(parsed.data.enabled !== undefined ? { enabled: parsed.data.enabled } : {}),
    },
  });
  return NextResponse.json(schedule);
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") {
    const denied = await assertAdminApiAcl(session.user.id, "reports", "write");
    if (denied) return denied;
  }

  const { id } = await ctx.params;
  await db.reportSchedule.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
