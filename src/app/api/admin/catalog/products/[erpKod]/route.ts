import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import {
  isAllowedOverlayImageUrl,
  SHOP_OVERLAY_MAX_DESCRIPTION_CHARS,
  SHOP_OVERLAY_MAX_IMAGES,
} from "@/lib/shop-product-overlay";

const STAFF_ROLES = ["ADMIN", "ENGINEER", "SALES", "OPS"] as const;

const patchSchema = z
  .object({
    images: z.array(z.string()).max(SHOP_OVERLAY_MAX_IMAGES),
    descriptionSq: z.string().max(SHOP_OVERLAY_MAX_DESCRIPTION_CHARS).nullable().optional(),
    descriptionEn: z.string().max(SHOP_OVERLAY_MAX_DESCRIPTION_CHARS).nullable().optional(),
  })
  .strict();

function assertStaff(role: string | undefined) {
  if (!role || !STAFF_ROLES.includes(role as (typeof STAFF_ROLES)[number])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ erpKod: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const forbidden = assertStaff(session.user?.role);
  if (forbidden) return forbidden;
  const denied = await assertAdminApiAcl(session.user.id, "shop_products", "write");
  if (denied) return denied;

  const { erpKod: rawKod } = await ctx.params;
  const erpKod = decodeURIComponent(rawKod).trim();
  if (!erpKod) {
    return NextResponse.json({ error: "Missing product code" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });
  }

  const { images, descriptionSq, descriptionEn } = parsed.data;
  for (const url of images) {
    if (typeof url !== "string" || !isAllowedOverlayImageUrl(url)) {
      return NextResponse.json(
        { error: "Each image must be an https URL on res.cloudinary.com" },
        { status: 400 }
      );
    }
  }

  const imagesJson = JSON.stringify(images);

  const row = await db.shopProductOverlay.upsert({
    where: { erpKod },
    create: {
      erpKod,
      imagesJson,
      descriptionSq: descriptionSq ?? null,
      descriptionEn: descriptionEn ?? null,
    },
    update: {
      imagesJson,
      ...(descriptionSq !== undefined ? { descriptionSq } : {}),
      ...(descriptionEn !== undefined ? { descriptionEn } : {}),
    },
  });

  return NextResponse.json({
    erpKod: row.erpKod,
    imagesJson: row.imagesJson,
    descriptionSq: row.descriptionSq,
    descriptionEn: row.descriptionEn,
    updatedAt: row.updatedAt.toISOString(),
  });
}
