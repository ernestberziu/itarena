# Legacy `shop.*` subdomain → `/shop` (edge + Next)

Next.js **proxy** ([`src/proxy.ts`](../src/proxy.ts)) already **308-redirects** `Host: shop.example.com` to the apex host with path under `/shop`.

If requests can reach your CDN **before** Next (e.g. static assets, cached HTML), configure the same redirect there so SEO and bookmarks stay correct.

## Cloudflare (example)

**Bulk redirect** (Rules → Redirect Rules), or **Page Rule**:

- **If** hostname equals `shop.example.com`
- **Then** dynamic redirect to `https://example.com/shop$1` preserving path  
  (Expression-style: map `https://shop.example.com/:path*` → `https://example.com/shop/:path*`; for root `/`, map to `https://example.com/shop`.)

Use the same URL shape as in-app: `https://<apex>/shop` and `https://<apex>/shop/<rest>`.

## Vercel

Prefer this **proxy** (already in the repo). Optionally add a **Redirect** in `vercel.json` with a `has` host condition if the project serves multiple hostnames on one deployment:

```json
{
  "redirects": [
    {
      "source": "/:path*",
      "has": [{ "type": "host", "value": "shop.example.com" }],
      "destination": "https://example.com/shop/:path*",
      "permanent": true
    }
  ]
}
```

Replace hostnames with production values; wildcard `:path*` may need a second rule for `/` → `/shop`.

## Nginx (example)

```nginx
server {
  server_name shop.example.com;
  return 308 https://example.com/shop$request_uri;
}
```

Adjust `$request_uri` if the shop was previously at the subdomain root without a `/shop` prefix (the app proxy maps `/cart` → `/shop/cart`).
