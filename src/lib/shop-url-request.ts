import { headers } from "next/headers";
import type { ShopUrlRequestContext } from "@/lib/shop-url";

/** Server-only: current request host/proto for `shopUrl(..., ctx)`. */
export async function getShopUrlRequestContext(): Promise<ShopUrlRequestContext | undefined> {
  const h = await headers();
  const requestHost = (h.get("x-forwarded-host") ?? h.get("host") ?? "")
    .split(",")[0]
    .trim();
  if (!requestHost) return undefined;
  const requestProto = (h.get("x-forwarded-proto") ?? "https").split(",")[0].trim();
  return { requestHost, requestProto };
}
