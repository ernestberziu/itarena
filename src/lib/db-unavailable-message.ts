/** User-facing hint when Prisma/Postgres queries fail (dashboard, orders, etc.). */

function databaseUrlHost(): string | null {
  const raw = process.env.DATABASE_URL?.trim();
  if (!raw) return null;
  try {
    return new URL(raw.replace(/^postgres(ql)?:\/\//i, "http://")).hostname;
  } catch {
    return null;
  }
}

function isLocalDatabase(): boolean {
  const host = databaseUrlHost();
  if (!host) return true;
  return host === "localhost" || host === "127.0.0.1" || host === "postgres";
}

/**
 * Sq / En descriptions for EmptyState when the DB is unreachable or schema is out of date.
 */
export function dbUnavailableDescription(locale: string, context: "dashboard" | "orders"): {
  sq: string;
  en: string;
} {
  const local = isLocalDatabase();

  if (local) {
    const sqLead =
      context === "dashboard"
        ? "Nuk mund të ngarkohet paneli."
        : "Nuk mund të lexohen porositë.";
    const enLead =
      context === "dashboard"
        ? "Cannot load the dashboard."
        : "Cannot load orders.";
    return {
      sq: `${sqLead} Nis Postgres: docker compose up -d postgres. Në .env përdor DATABASE_URL=postgresql://itarena:itarena@localhost:5432/itarena, pastaj npx prisma migrate deploy dhe rinisni npm run dev.`,
      en: `${enLead} Start Postgres: docker compose up -d postgres. Set DATABASE_URL=postgresql://itarena:itarena@localhost:5432/itarena in .env, then run npx prisma migrate deploy and restart npm run dev.`,
    };
  }

  const sqLead =
    context === "dashboard"
      ? "Nuk mund të ngarkohet paneli."
      : "Nuk mund të lexohen porositë.";
  const enLead =
    context === "dashboard" ? "Cannot load the dashboard." : "Cannot load orders.";

  return {
    sq: `${sqLead} Kontrolloni që DATABASE_URL në .env është i saktë (p.sh. Prisma Postgres / db.prisma.io), ekzekutoni npx prisma migrate deploy për të aplikuar migrimet në bazën remote, pastaj rinisni npm run dev.`,
    en: `${enLead} Verify DATABASE_URL in .env (e.g. Prisma Postgres at db.prisma.io), run npx prisma migrate deploy to apply migrations on the remote database, then restart npm run dev.`,
  };
}
