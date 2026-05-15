/**
 * Waits for PostgreSQL (default 5432) so Prisma can connect on dev startup.
 */
import net from "node:net";

const host = process.env.WAIT_DB_HOST ?? "127.0.0.1";
const port = Number.parseInt(process.env.WAIT_DB_PORT ?? "5432", 10);
const intervalMs = Number.parseInt(process.env.WAIT_DB_INTERVAL_MS ?? "2000", 10);
const maxAttempts = Number.parseInt(process.env.WAIT_DB_ATTEMPTS ?? "45", 10);

function tryOnce(portToTry) {
  return new Promise((resolve) => {
    const socket = net.connect({ host, port: portToTry }, () => {
      socket.end();
      resolve(true);
    });
    socket.setTimeout(3000);
    socket.on("error", () => resolve(false));
    socket.on("timeout", () => {
      socket.destroy();
      resolve(false);
    });
  });
}

async function main() {
  for (let i = 1; i <= maxAttempts; i++) {
    if (await tryOnce(port)) {
      console.log(`[wait-for-databases] PostgreSQL ${host}:${port} is ready.`);
      return;
    }
    console.log(
      `[wait-for-databases] waiting for PostgreSQL ${host}:${port}… (${i}/${maxAttempts})`
    );
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  console.error(
    `[wait-for-databases] timeout waiting for PostgreSQL on ${host}:${port}.`
  );
  console.error("  Run: docker compose up -d postgres");
  process.exit(1);
}

main();
