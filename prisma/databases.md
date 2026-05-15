# Database (single Postgres + Prisma)

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL for the main app (`prisma/schema.prisma` → `@prisma/client` → [`src/lib/db.ts`](../src/lib/db.ts)) |

## Shop catalog and stock

Shop product listings, storefront, admin catalog read-only grids, quote validation by SKU, and stock shown in the UI all come from **Financa5Api** at runtime (`FINANCA5_API_URL` / `FINANCA5_API_KEY`). There is no second Prisma schema or SQL Server catalog in this repo.

Portal **orders** are stored in Postgres only; inventory is updated in ERP separately (there is no local `Product` table to decrement).

## Local development

1. Copy [`.env.example`](../.env.example) to `.env` and set `DATABASE_URL`, auth, and Financa5 variables.
2. `docker compose up -d postgres` (optional: `meilisearch` is in the same compose file).
3. `npx prisma migrate deploy` or `npx prisma db push`, then `npx prisma db seed` (Postgres only). The seed command is defined in [`prisma.config.ts`](../prisma.config.ts) and runs with **`tsx`**; that file imports **`dotenv/config`** so `.env` is loaded (Prisma skips its default `.env` load when a config file is present).
4. For local shop/catalog data, run `npm run dev:with-mock` or start `node dev-mock/financa5/server.js` so Financa5Api is reachable.

**Postgres “User was denied access”:** usually a mismatch between `DATABASE_URL` and the running container. Defaults should match `docker-compose.yml` (`itarena` / `itarena` / DB `itarena`). If you changed Postgres env vars after the first container start, you may need `docker compose down -v` (deletes volume data) and bring Postgres up again.

## Migrating from the old dual-database setup

If you previously used a SQL Server shop database:

1. Remove from `.env`: `SHOP_DATABASE_URL`, `MSSQL_SA_PASSWORD`, and any SQL Server-only notes.
2. Remove the `sqlserver` Docker service (no longer in `docker-compose.yml` in this layout).
3. Use **Financa5Api** as the sole source for catalog/SKU validation; discontinue any workflows that depended on `@prisma/shop-client` or `shopDb`.
4. `npm install` then `npm run db:generate` runs a single `prisma generate`.

Legacy content that lived only in SQL Server (`products` / `product_categories` in the old shop DB) should be migrated in ERP so Financa5 exposes those articles; Postgres migrations in `prisma/migrations/` cover app data only.
