import "./database-url";
import { PrismaClient } from "@prisma/client";

/** Bump when Prisma schema changes so dev hot-reload picks up new fields. */
const PRISMA_CLIENT_VERSION = "20260521160000-notification-enterprise";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaClientVersion?: string;
};

const prismaLog =
  process.env.PRISMA_LOG === "1"
    ? (["query", "warn", "error"] as const)
    : process.env.NODE_ENV === "production"
      ? (["error"] as const)
      : ([] as const);

function createPrismaClient() {
  return new PrismaClient({
    log: [...prismaLog],
  });
}

if (
  process.env.NODE_ENV !== "production" &&
  globalForPrisma.prisma &&
  globalForPrisma.prismaClientVersion !== PRISMA_CLIENT_VERSION
) {
  void globalForPrisma.prisma.$disconnect();
  globalForPrisma.prisma = undefined;
}

export const db =
  globalForPrisma.prisma ??
  createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
  globalForPrisma.prismaClientVersion = PRISMA_CLIENT_VERSION;
}
