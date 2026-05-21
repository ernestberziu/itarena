import {  NextRequest, NextResponse  } from "next/server";
import { apiErr } from "@/lib/i18n/err";
import { auth } from "@/lib/auth";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import { getTemplateSettings, upsertTemplateSettings } from "@/lib/templates/settings";
import type { TemplateSettingsConfig } from "@/lib/templates/types";
import { z } from "zod";

const settingsSchema = z.object({
  defaultLanguage: z.enum(["sq", "en"]),
  authorizedRepresentative: z.string().min(1),
  representativeTitle: z.string().min(1),
  companyLegalName: z.string().min(1),
  companyNuis: z.string(),
  companyAddress: z.string().min(1),
  companyPhone: z.string(),
  companyEmail: z.string().email(),
  companyBank: z.string().optional(),
  legalDisclaimer: z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return apiErr("sq", "unauthorized", 401);
  const denied = await assertAdminApiAcl(session.user.id, "templates", "read");
  if (denied) return denied;
  return NextResponse.json(await getTemplateSettings());
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiErr(req, "unauthorized", 401);
  const denied = await assertAdminApiAcl(session.user.id, "templates", "write");
  if (denied) return denied;

  const parsed = settingsSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const config = await upsertTemplateSettings(parsed.data as TemplateSettingsConfig);
  return NextResponse.json(config);
}
