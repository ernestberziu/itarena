import { getPublicAppBaseUrl } from "@/lib/shop-url";
import type { PublicShareResourceType } from "@/lib/public-share/types";

export function publicSharePath(resourceType: PublicShareResourceType, token: string): string {
  const segment = resourceType === "TICKET" ? "ticket" : "project";
  return `/share/${segment}/${token}`;
}

export function publicShareUrl(resourceType: PublicShareResourceType, token: string): string {
  return `${getPublicAppBaseUrl()}${publicSharePath(resourceType, token)}`;
}
