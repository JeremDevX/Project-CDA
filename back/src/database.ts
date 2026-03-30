import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "./generated/prisma/client";

const adapter = new PrismaBetterSqlite3(
  {
    url: process.env.DATABASE_URL ?? "file:./dev.db",
  },
  {
    // Keep compatibility with the existing SQLite timestamp storage format.
    timestampFormat: "unixepoch-ms",
  },
);

export const prisma = new PrismaClient({ adapter });

export async function initDatabase() {
  await prisma.$connect();
}
