import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import { getSiteSettingsBundle, patchSiteSettingsSection } from "@/lib/site-content/db";
import { revalidateSitePaths } from "@/lib/site-content/revalidate";
import { sectionSchemas } from "@/lib/site-content/schemas";
import type { SiteSettingsSectionKey } from "@/lib/site-content/types";

const patchSchema = z.object({
  section: z.enum([
    "hero",
    "contact",
    "social",
    "footer",
  ]),
  data: z.unknown(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await assertAdminApiAcl(session.user.id, "settings", "read");
  if (denied) return denied;

  const settings = await getSiteSettingsBundle();
  return NextResponse.json({ settings });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await assertAdminApiAcl(session.user.id, "settings", "write");
  if (denied) return denied;

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });
  }

  const section = parsed.data.section as SiteSettingsSectionKey;
  const schema = sectionSchemas[section];
  const dataParsed = schema.safeParse(parsed.data.data);
  if (!dataParsed.success) {
    return NextResponse.json({ error: "Invalid section data", details: dataParsed.error.flatten() }, { status: 400 });
  }

  try {
    const settings = await patchSiteSettingsSection(section, dataParsed.data);
    revalidateSitePaths();
    return NextResponse.json({ settings, updatedAt: new Date().toISOString() });
  } catch {
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
