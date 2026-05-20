/**
 * Inserts or refreshes the demo order (DEMO-ORD-2026-001) for UI preview.
 * Usage: npm run db:seed-demo-order
 */
import "dotenv/config";
import "../prisma/ensure-database-url";
import { PrismaClient } from "@prisma/client";
import { seedDemoOrder } from "../prisma/seed-demo-order";

const prisma = new PrismaClient();

async function main() {
  const order = await seedDemoOrder(prisma);
  if (order) {
    console.log("\nView in admin: /admin/orders");
    console.log("View in portal (as client@demo.al): /portal/orders");
    console.log(`Order number: ${order.orderNumber}`);
    return;
  }
  console.log("\nRun full seed first: npm run db:seed");
}

main()
  .catch((e) => {
    console.error("❌ Demo order seed error:", e);
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("denied access") || msg.includes("Can't reach database")) {
      console.error("\nDatabase connection failed. Check:");
      console.error("  1. DATABASE_URL in .env is postgresql:// or postgres:// (not sqlserver://)");
      console.error("  2. Postgres is running: docker compose up -d postgres");
      console.error("  3. Migrations applied: npm run db:migrate");
    }
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
