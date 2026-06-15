import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";

function getDatabasePoolMax() {
  const value = Number(process.env.DATABASE_POOL_MAX ?? 1);

  return Number.isFinite(value) && value > 0 ? value : 1;
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 5_000,
  max: getDatabasePoolMax(),
});

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function hasCurrentDelegates(client: PrismaClient) {
  const delegates = client as unknown as Record<string, unknown>;

  return Boolean(delegates.postShare && delegates.externalShare && delegates.notification);
}

const prisma = globalForPrisma.prisma && hasCurrentDelegates(globalForPrisma.prisma)
  ? globalForPrisma.prisma
  : new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export { prisma };
