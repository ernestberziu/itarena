/**
 * Ensures `DATABASE_URL` points at PostgreSQL for the main Prisma schema.
 * Used by `prisma/seed.ts` (same-folder import) and re-exported from `src/lib/database-url.ts`
 * for Next.js / `next.config.ts` — avoids importing `src/` from Prisma CLI (ESM resolution).
 */
const DEFAULT_DATABASE_URL =
  "postgresql://itarena:itarena@localhost:5432/itarena";

function isPostgresUrl(url: string): boolean {
  return /^postgres(ql)?:\/\//i.test(url.trim());
}

const raw = process.env.DATABASE_URL?.trim();
if (!raw || !isPostgresUrl(raw)) {
  if (process.env.NODE_ENV !== "production") {
    process.env.DATABASE_URL = DEFAULT_DATABASE_URL;
    console.warn(
      "[itarena] DATABASE_URL must be PostgreSQL (postgresql://…). Using local Docker default. Update your .env — remove legacy sqlserver:// from DATABASE_URL."
    );
  }
}

export { DEFAULT_DATABASE_URL };
