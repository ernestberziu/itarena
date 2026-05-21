import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import { findPosProductByBarcode } from "@/lib/pos/products";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const denied = await assertAdminApiAcl(session.user.id, "pos_sale", "read");
  if (denied) return denied;

  const code = new URL(req.url).searchParams.get("code")?.trim();
  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  try {
    const product = await findPosProductByBarcode(code);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ product });
  } catch (e) {
    console.error("[pos/products/by-barcode]", e);
    return NextResponse.json({ error: "Failed to lookup product" }, { status: 500 });
  }
}
