import {  NextRequest, NextResponse  } from "next/server";
import { apiErr } from "@/lib/i18n/err";
import { auth } from "@/lib/auth";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import { MIN_POS_PRODUCT_SEARCH, searchPosProducts } from "@/lib/pos/products";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiErr(req, "unauthorized", 401);
  }
  const denied = await assertAdminApiAcl(session.user.id, "pos_sale", "read");
  if (denied) return denied;

  const q = new URL(req.url).searchParams.get("q")?.trim();
  if (!q || q.length < MIN_POS_PRODUCT_SEARCH) {
    return NextResponse.json({ items: [] });
  }

  try {
    const items = await searchPosProducts(q);
    return NextResponse.json({ items });
  } catch (e) {
    console.error("[pos/products]", e);
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
  }
}
