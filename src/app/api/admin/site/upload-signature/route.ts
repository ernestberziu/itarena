import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { getUploadUrl } from "@/lib/storage";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";

const bodySchema = z
  .object({
    contentType: z.string().min(3).max(200),
    extension: z.string().max(12).optional(),
  })
  .strict();

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const denied = await assertAdminApiAcl(session.user.id, "settings", "write");
  if (denied) return denied;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const prepared = await getUploadUrl("site-cms", parsed.data.contentType, parsed.data.extension ?? "");
    return NextResponse.json({
      uploadUrl: prepared.uploadUrl,
      uploadFields: prepared.uploadFields,
      fileUrl: prepared.fileUrl,
      key: prepared.key,
      resourceType: prepared.resourceType,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Upload unavailable";
    return NextResponse.json({ error: msg }, { status: 503 });
  }
}
