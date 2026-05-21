import { NextResponse } from "next/server";
import { getFinanca5Client } from "@/lib/financa5-client";

export const dynamic = "force-dynamic";

/** Server-side ERP connectivity probe (for debugging shop/ERP issues). */
export async function GET() {
  const baseUrl = (process.env.FINANCA5_API_URL ?? "").replace(/\/$/, "");
  const hasKey = Boolean(process.env.FINANCA5_API_KEY);

  if (!baseUrl || !hasKey) {
    return NextResponse.json(
      {
        ok: false,
        error: "FINANCA5_API_URL or FINANCA5_API_KEY is not configured",
        baseUrl: baseUrl || null,
        hasKey,
      },
      { status: 503 }
    );
  }

  try {
    const client = getFinanca5Client();
    const health = await client.healthCheck();
    const categories = await client.getAllCategories();
    const products = await client.getProductsPage(1, 5);

    return NextResponse.json({
      ok: true,
      baseUrl,
      health,
      categories: categories.length,
      productsSample: products.items.length,
      totalProducts: products.totalCount,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        ok: false,
        baseUrl,
        hasKey,
        error: message,
      },
      { status: 502 }
    );
  }
}
