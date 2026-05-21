import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/portal",
        "/api",
        "/share/",
        "/en/share/",
        "/shop/admin",
        "/shop/cart",
        "/shop/checkout/",
        "/en/shop/admin",
        "/en/shop/cart",
        "/en/shop/checkout/",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
