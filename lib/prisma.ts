import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  let connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  // Use SSL when the URL indicates it (Supabase or sslmode=require). We strip sslmode from the URL
  // so the pg driver doesn't apply libpq-style verification (which can ignore our rejectUnauthorized).
  const useSSL =
    connectionString.includes("supabase.co") ||
    connectionString.includes("sslmode=require");

  // Strip sslmode and related params from the URL so pg doesn't apply libpq-style SSL (which
  // can override our rejectUnauthorized). We enable SSL only via the ssl option below.
  if (useSSL) {
    connectionString = connectionString
      .replace(/[?&]sslmode=[^&]*/g, "")
      .replace(/[?&]sslaccept=[^&]*/g, "")
      .replace(/[?&]uselibpqcompat=[^&]*/g, "")
      .replace(/\?&/, "?")
      .replace(/\?$/, "")
      .replace(/&$/, "");
    if (connectionString.includes("?") && connectionString.endsWith("&")) {
      connectionString = connectionString.slice(0, -1);
    }
  }

  // Only verify the server certificate in production. Otherwise allow self-signed / untrusted chains.
  const acceptInsecure =
    process.env.DATABASE_SSL_ACCEPT_INSECURE === "true" ||
    process.env.NODE_ENV !== "production";
  const sslOptions = useSSL
    ? { rejectUnauthorized: !acceptInsecure }
    : undefined;

  const pool = new Pool({
    connectionString,
    ssl: sslOptions,
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}


