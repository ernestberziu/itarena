import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import { libraryTemplateSchema } from "@/lib/templates/schemas";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await assertAdminApiAcl(session.user.id, "templates", "read");
  if (denied) return denied;

  const type = new URL(req.url).searchParams.get("type");
  const templates = await db.documentTemplate.findMany({
    where: type ? { type } : undefined,
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(templates);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await assertAdminApiAcl(session.user.id, "templates", "write");
  if (denied) return denied;

  const parsed = libraryTemplateSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const defaultLanguage = parsed.data.defaultLanguage ?? "sq";

  if (parsed.data.isDefault) {
    await db.documentTemplate.updateMany({
      where: { type: parsed.data.type },
      data: { isDefault: false },
    });
  }

  const template = await db.documentTemplate.create({
    data: {
      name: parsed.data.name,
      type: parsed.data.type,
      language: defaultLanguage,
      defaultLanguage,
      bodyMarkdown: defaultLanguage === "en" ? parsed.data.bodyMarkdownEn : parsed.data.bodyMarkdownSq,
      bodyMarkdownSq: parsed.data.bodyMarkdownSq,
      bodyMarkdownEn: parsed.data.bodyMarkdownEn,
      isDefault: parsed.data.isDefault ?? false,
      createdById: session.user.id,
    },
  });

  return NextResponse.json(template, { status: 201 });
}
