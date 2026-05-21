import {  NextRequest, NextResponse  } from "next/server";
import { apiErr } from "@/lib/i18n/err";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import { libraryTemplateSchema } from "@/lib/templates/schemas";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return apiErr(req, "unauthorized", 401);
  const denied = await assertAdminApiAcl(session.user.id, "templates", "write");
  if (denied) return denied;

  const { id } = await params;
  const parsed = libraryTemplateSchema.partial().safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  if (parsed.data.isDefault && parsed.data.type) {
    await db.documentTemplate.updateMany({
      where: { type: parsed.data.type, id: { not: id } },
      data: { isDefault: false },
    });
  }

  const template = await db.documentTemplate.update({
    where: { id },
    data: {
      ...(parsed.data.name && { name: parsed.data.name }),
      ...(parsed.data.bodyMarkdownSq && { bodyMarkdownSq: parsed.data.bodyMarkdownSq }),
      ...(parsed.data.bodyMarkdownEn && { bodyMarkdownEn: parsed.data.bodyMarkdownEn }),
      ...(parsed.data.bodyMarkdownSq && {
        bodyMarkdown: parsed.data.bodyMarkdownSq,
      }),
      ...(parsed.data.defaultLanguage && {
        defaultLanguage: parsed.data.defaultLanguage,
        language: parsed.data.defaultLanguage,
      }),
      ...(parsed.data.isDefault !== undefined && { isDefault: parsed.data.isDefault }),
    },
  });
  return NextResponse.json(template);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return apiErr(_req, "unauthorized", 401);
  const denied = await assertAdminApiAcl(session.user.id, "templates", "write");
  if (denied) return denied;

  const { id } = await params;
  await db.documentTemplate.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
