import {  NextRequest, NextResponse  } from "next/server";
import { apiErr } from "@/lib/i18n/err";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";

const postSchema = z.object({
  presetId: z.string().min(1),
  cron: z.string().min(5).max(64),
  recipients: z.array(z.string().email()).min(1),
  enabled: z.boolean().optional().default(true),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return apiErr("sq", "unauthorized", 401);
  const denied = await assertAdminApiAcl(session.user.id, "reports", "read");
  if (denied) return denied;

  const schedules = await db.reportSchedule.findMany({
    include: { preset: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(schedules);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiErr(req, "unauthorized", 401);
  if (session.user.role !== "ADMIN") {
    const denied = await assertAdminApiAcl(session.user.id, "reports", "write");
    if (denied) return denied;
  }

  const body = await req.json().catch(() => null);
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const schedule = await db.reportSchedule.create({
    data: {
      presetId: parsed.data.presetId,
      cron: parsed.data.cron,
      recipients: JSON.stringify(parsed.data.recipients),
      enabled: parsed.data.enabled,
      createdById: session.user.id,
    },
  });
  return NextResponse.json(schedule, { status: 201 });
}
