# IT Arena (Next.js)

Monorepo web app with a **single PostgreSQL** database via Prisma. The **shop product catalog**, stock hints, SKU validation for quotes, and storefront browse/checkout read from **Financa5Api** only — no second database or `@prisma/shop-client`.

## Prerequisites

- Node.js + npm  
- Docker (optional, for local Postgres from `docker-compose.yml`)

## Environment

Copy `.env.example` to `.env`. You need at least:

- `DATABASE_URL` — PostgreSQL  
- `AUTH_SECRET`, `AUTH_URL` (NextAuth-compatible fallbacks in code: `NEXTAUTH_*`)  
- `FINANCA5_API_URL`, `FINANCA5_API_KEY` — storefront + admin catalog (read-only) + quote SKU checks  

Optional blocks are documented in `.env.example` (email, Cloudinary, `PRISMA_LOG`, etc.).

## Shop URL (single domain)

The storefront lives at **`/shop`** on the same host as the marketing site (e.g. `https://example.com/shop`). [`src/lib/shop-url.ts`](src/lib/shop-url.ts) builds absolute shop URLs from `PUBLIC_URL` or `NEXT_PUBLIC_APP_URL` + `/shop`.

**Legacy `shop.example.com` hostnames:** [`src/proxy.ts`](src/proxy.ts) (Next.js **proxy** convention) responds with a **308 redirect** to the apex host and `/shop…` path. For traffic that never hits Next (CDN-only), add the same rule at the edge — see [`docs/shop-subdomain-redirects.md`](docs/shop-subdomain-redirects.md).

## Local development

```bash
docker compose up -d postgres    # optional; matches default DATABASE_URL
npm install                        # runs prisma generate (single schema)
npx prisma migrate deploy          # or: npx prisma db push
npx prisma db seed
npm run dev                        # tries Docker compose + local Postgres wait, then Next
# npm run dev:with-mock            # adds Financa5 mock alongside Next
```

`npm run dev` **does not require Docker to be running**: if the Docker daemon is missing (for example Docker Desktop stopped), Compose is skipped, a short warning is printed, and Next still starts. If `DATABASE_URL` points at **`localhost` / `127.0.0.1`**, the script waits for Postgres; if waiting fails or you use a **hosted** Postgres, set `SKIP_DB_WAIT=1` so startup is immediate. Override with **`SKIP_DOCKER=1`** to always skip Compose.

Catalog data for `/shop` and admin read-only grids requires Financa5. Use **`npm run dev:with-mock`** or run `node dev-mock/financa5/server.js` alongside `npm run dev`.

**Demo sign-in** (after `npx prisma db seed`): `admin@itarena.al` / `Admin@123!`, `engineer@itarena.al` / `Engineer@123!`, `client@demo.al` / `Client@123!`. Re-run seed anytime to reset those passwords.

See [`prisma/databases.md`](prisma/databases.md) for Postgres notes and upgrade notes if you migrated from an older dual-database (`SHOP_DATABASE_URL` / SQL Server) setup.

## Build

```bash
npm run build
```

Runs `prisma generate` then `next build`.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
