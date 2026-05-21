import {  NextRequest, NextResponse  } from "next/server";
import { apiErr } from "@/lib/i18n/err";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { getUploadUrl } from "@/lib/storage";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";

const STAFF_ROLES = ["ADMIN", "ENGINEER", "SALES", "OPS"] as const;

const bodySchema = z
  .object({
    contentType: z.string().min(3).max(200),
    extension: z.string().max(12).optional(),
  })
  .strict();

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !session.user.role) {
    return apiErr(req, "unauthorized", 401);
  }
  if (!STAFF_ROLES.includes(session.user.role as (typeof STAFF_ROLES)[number])) {
    return apiErr(req, "forbidden", 403);
  }
  const denied = await assertAdminApiAcl(session.user.id, "shop_products", "write");
  if (denied) return denied;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiErr(req, "invalidJson", 400);
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return apiErr(req, "invalidBody", 400, { details: parsed.error.flatten() });
  }

  try {
    const prepared = await getUploadUrl("shop/products", parsed.data.contentType, parsed.data.extension ?? "");
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
