import { randomBytes } from "node:crypto";
import {  NextRequest, NextResponse  } from "next/server";
import { apiErr } from "@/lib/i18n/err";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiErr(req, "unauthorized", 401);
  const denied = await assertAdminApiAcl(session.user.id, "reports", "read");
  if (denied) return denied;

  const token = new URL(req.url).searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

  const link = await db.reportShareLink.findUnique({ where: { token } });
  if (!link) return apiErr(req, "notFound", 404);
  if (link.expiresAt && link.expiresAt < new Date()) {
    return NextResponse.json({ error: "Expired" }, { status: 410 });
  }

  return NextResponse.json({
    paramsJson: link.paramsJson,
    presetId: link.presetId,
    expiresAt: link.expiresAt?.toISOString() ?? null,
  });
}

const postSchema = z.object({
  presetId: z.string().optional(),
  paramsJson: z.record(z.string(), z.unknown()),
  expiresInDays: z.number().int().min(1).max(90).optional().default(30),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiErr(req, "unauthorized", 401);
  if (session.user.role !== "ADMIN") {
    const denied = await assertAdminApiAcl(session.user.id, "reports", "write");
    if (denied) return denied;
  }

  const parsed = postSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const token = randomBytes(24).toString("base64url");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + parsed.data.expiresInDays);

  const link = await db.reportShareLink.create({
    data: {
      token,
      presetId: parsed.data.presetId ?? null,
      paramsJson: parsed.data.paramsJson as Prisma.InputJsonValue,
      expiresAt,
      createdById: session.user.id,
    },
  });

  return NextResponse.json({ token: link.token, expiresAt: link.expiresAt?.toISOString() });
}
