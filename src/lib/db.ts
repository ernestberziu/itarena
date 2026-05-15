import "./database-url";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prismaLog =
  process.env.PRISMA_LOG === "1"
    ? (["query", "warn", "error"] as const)
    : process.env.NODE_ENV === "production"
      ? (["error"] as const)
      : ([] as const);

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: [...prismaLog],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
