/**
 * Ensures `DATABASE_URL` points at PostgreSQL for the main Prisma schema.
 * Import from `next.config.ts` before any route bundle instantiates Prisma.
 *
 * Implementation lives under `prisma/` so `prisma db seed` can share it without
 * importing `src/` (Node ESM + ts-node cannot resolve extensionless `src` paths).
 */
export { DEFAULT_DATABASE_URL } from "../../prisma/ensure-database-url";
