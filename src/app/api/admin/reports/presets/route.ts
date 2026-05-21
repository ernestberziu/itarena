import {  NextRequest, NextResponse  } from "next/server";
import { apiErr } from "@/lib/i18n/err";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import { DEFAULT_PRESET_CONFIG } from "@/lib/reports/metric-registry";

const postSchema = z.object({
  name: z.string().min(1).max(120),
  configJson: z.record(z.string(), z.unknown()).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return apiErr("sq", "unauthorized", 401);
  const denied = await assertAdminApiAcl(session.user.id, "reports", "read");
  if (denied) return denied;

  const presets = await db.reportPreset.findMany({
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true, configJson: true, createdAt: true, updatedAt: true, createdById: true },
  });
  return NextResponse.json(presets);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiErr(req, "unauthorized", 401);
  if (session.user.role !== "ADMIN") {
    const denied = await assertAdminApiAcl(session.user.id, "reports", "write");
    if (denied) return denied;
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiErr(req, "invalidJson", 400);
  }
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const preset = await db.reportPreset.create({
    data: {
      name: parsed.data.name,
      createdById: session.user.id,
      configJson: (parsed.data.configJson ?? DEFAULT_PRESET_CONFIG) as Prisma.InputJsonValue,
    },
  });
  return NextResponse.json(preset, { status: 201 });
}
