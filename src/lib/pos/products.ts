import { getFinanca5Client } from "@/lib/financa5-client";
import type { Financa5Product } from "@/lib/financa5-client";
import type { PosProductRow } from "./types";

export const MIN_POS_PRODUCT_SEARCH = 2;

function toPosRow(p: Financa5Product): PosProductRow {
  return {
    sku: p.kod,
    name: p.name,
    barcode: p.barcode,
    stock: Math.max(0, Math.round(p.stock)),
    price: p.priceWithVat,
  };
}

function isSellable(p: Financa5Product): boolean {
  return p.isActive && Math.max(0, Math.round(p.stock)) > 0;
}

/** Search catalog via Financa5 API (no full-catalog download). */
export async function searchPosProducts(q?: string | null): Promise<PosProductRow[]> {
  const term = q?.trim() ?? "";
  if (term.length < MIN_POS_PRODUCT_SEARCH) return [];

  const client = getFinanca5Client();
  const page = await client.searchProducts({
    search: term,
    pageSize: 50,
    inStock: true,
  });

  return page.items.filter(isSellable).map(toPosRow);
}

export async function findPosProductByBarcode(code: string): Promise<PosProductRow | null> {
  const trimmed = code.trim();
  if (!trimmed) return null;

  const client = getFinanca5Client();

  try {
    const byBarcode = await client.getProductByBarcode(trimmed);
    if (isSellable(byBarcode)) return toPosRow(byBarcode);
  } catch {
    // fall through to SKU lookup
  }

  try {
    const byKod = await client.getProductByKod(trimmed);
    if (isSellable(byKod)) return toPosRow(byKod);
  } catch {
    return null;
  }

  return null;
}
