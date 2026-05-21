import {  NextRequest, NextResponse  } from "next/server";
import { apiErr } from "@/lib/i18n/err";
import { auth } from "@/lib/auth";
import { getFinanca5Client } from "@/lib/financa5-client";

export type CatalogSearchItem = {
  kod: string;
  name: string;
  price: number;
  vatRate: number;
  unit: string;
};

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiErr(req, "unauthorized", 401);
  }

  const q = (req.nextUrl.searchParams.get("q") ?? "").trim().toLowerCase();

  try {
    const client = getFinanca5Client();
    // Fetch first 300 active products — enough for a fast search
    const page = await client.getProductsPage(1, 300);
    let items = page.items.filter((p) => p.isActive);

    if (q) {
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.kod.toLowerCase().includes(q)
      );
    }

    const results: CatalogSearchItem[] = items.slice(0, 50).map((p) => ({
      kod: p.kod,
      name: p.name,
      price: p.price,
      vatRate: p.vatRate,
      unit: p.unit,
    }));

    return NextResponse.json(results);
  } catch {
    return NextResponse.json({ error: "Failed to fetch catalog" }, { status: 502 });
  }
}
