/**
 * Shared prelude for npm run dev / dev:with-mock:
 * - Optionally start Postgres via Compose when Docker daemon is reachable
 * - Optionally wait on TCP until local Postgres listens (parses DATABASE_URL from .env)
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

function loadDatabaseUrlFromDotenv() {
  if (process.env.DATABASE_URL) return;
  const envPath = join(process.cwd(), ".env");
  if (!existsSync(envPath)) return;
  try {
    const txt = readFileSync(envPath, "utf8");
    for (const line of txt.split("\n")) {
      const trimmed = line.trim();
      if (trimmed.startsWith("#") || !trimmed) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const k = trimmed.slice(0, eq).trim();
      if (k !== "DATABASE_URL") continue;
      let v = trimmed.slice(eq + 1).trim();
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1);
      }
      process.env.DATABASE_URL = v;
      break;
    }
  } catch {
    /* ignore */
  }
}

function dockerDaemonAvailable() {
  const r = spawnSync("docker", ["info"], { stdio: "pipe" });
  return r.status === 0;
}

/** After `userinfo@`, returns { host, port } for PostgreSQL URLs. */
function postgresHostPortFromUrl(raw) {
  if (!raw?.trim()) return null;
  try {
    const noQuery = raw.split("?")[0];
    const at = noQuery.lastIndexOf("@");
    if (at === -1) return null;
    const hostPart = noQuery.slice(at + 1);
    const slash = hostPart.indexOf("/");
    const hostPort = slash === -1 ? hostPart : hostPart.slice(0, slash);
    const colon = hostPort.lastIndexOf(":");
    if (colon === -1)
      return { host: hostPort, port: 5432 };
    return {
      host: hostPort.slice(0, colon),
      port: Number.parseInt(hostPort.slice(colon + 1), 10) || 5432,
    };
  } catch {
    return null;
  }
}

export function bootstrapDevDb() {
  loadDatabaseUrlFromDotenv();

  if (process.env.SKIP_DOCKER === "1") {
    console.log("[dev] SKIP_DOCKER=1 — skipping docker compose.");
  } else if (!dockerDaemonAvailable()) {
    console.warn(
      "[dev] Docker daemon not available (often: Docker Desktop is not running).\n" +
        "      Skipping `docker compose up -d postgres`.\n" +
        "      → Start Docker and run npm run db:up, or use a remote DATABASE_URL and SKIP_DB_WAIT=1."
    );
  } else {
    const up = spawnSync(
      "docker",
      ["compose", "up", "-d", "postgres"],
      { stdio: "inherit", cwd: process.cwd(), env: process.env }
    );
    if (up.status !== 0)
      console.warn("[dev] docker compose exited non-zero — continuing anyway.");
  }

  if (process.env.SKIP_DB_WAIT === "1") {
    console.log("[dev] SKIP_DB_WAIT=1 — skipping Postgres TCP wait.");
    return;
  }

  const raw = process.env.DATABASE_URL ?? "";
  const hp = postgresHostPortFromUrl(raw);
  const looksLocal =
    hp &&
    (hp.host === "localhost" ||
      hp.host === "127.0.0.1" ||
      hp.host.startsWith("host.docker.internal"));
  const noUrlConfigured = !raw.trim();

  if (!noUrlConfigured && !looksLocal)
    console.log("[dev] DATABASE_URL does not target local Postgres — skipping wait-for-databases.");

  if (looksLocal || noUrlConfigured) {
    if (hp) {
      process.env.WAIT_DB_HOST ??= hp.host;
      process.env.WAIT_DB_PORT ??= String(hp.port);
    }

    const w = spawnSync(
      process.execPath,
      ["scripts/wait-for-databases.mjs"],
      {
        stdio: "inherit",
        cwd: process.cwd(),
        env: process.env,
      }
    );
    if (w.status !== 0) {
      console.warn(
        "[dev] Postgres wait failed.\n" +
          "      Start Docker (npm run db:up) or set SKIP_DB_WAIT=1 if your DB is already up elsewhere.\n" +
          "      Starting Next.js anyway — routes that need the DB may error until Postgres is reachable."
      );
    }
  }
}
