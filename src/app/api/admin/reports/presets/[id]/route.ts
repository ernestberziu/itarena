import {  NextRequest, NextResponse  } from "next/server";
import { apiErr } from "@/lib/i18n/err";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";

const patchSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  configJson: z.record(z.string(), z.unknown()).optional(),
});

async function assertWrite(session: { user: { id: string; role: string } }) {
  if (session.user.role === "ADMIN") return null;
  return assertAdminApiAcl(session.user.id, "reports", "write");
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return apiErr(req, "unauthorized", 401);
  const denied = await assertWrite(session);
  if (denied) return denied;

  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  try {
    const preset = await db.reportPreset.update({
      where: { id },
      data: {
        ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}),
        ...(parsed.data.configJson !== undefined
          ? { configJson: parsed.data.configJson as Prisma.InputJsonValue }
          : {}),
      },
    });
    return NextResponse.json(preset);
  } catch {
    return apiErr(req, "notFound", 404);
  }
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return apiErr(_req, "unauthorized", 401);
  const denied = await assertWrite(session);
  if (denied) return denied;

  const { id } = await ctx.params;
  try {
    await db.reportPreset.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return apiErr(_req, "notFound", 404);
  }
}
