import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    throw new Error("DATABASE_URL is not set");
  }

  // Detect whether we need SSL (Supabase or explicit sslmode=require).
  const useSSL =
    raw.includes("supabase.co") ||
    raw.includes("supabase.com") ||
    raw.includes("sslmode=require");

  // Strip SSL-related query params using the URL API instead of regex,
  // so the pg driver doesn't try to apply libpq-style verification on top
  // of our own ssl option below.
  let connectionString = raw;
  if (useSSL) {
    try {
      const u = new URL(raw);
      u.searchParams.delete("sslmode");
      u.searchParams.delete("sslaccept");
      u.searchParams.delete("uselibpqcompat");
      connectionString = u.toString();
    } catch {
      // If the URL is somehow unparseable, fall back to the original string.
      connectionString = raw;
    }
  }

  // Only verify the server certificate in production. Allow self-signed/untrusted
  // chains in development (common with Supabase local or free-tier).
  const acceptInsecure =
    process.env.DATABASE_SSL_ACCEPT_INSECURE === "true" ||
    process.env.NODE_ENV !== "production";
  const sslOptions = useSSL ? { rejectUnauthorized: !acceptInsecure } : undefined;

  const isSupabase =
    connectionString.includes("supabase.co") ||
    connectionString.includes("supabase.com");

  const pool = new Pool({
    connectionString,
    ssl: sslOptions,
    // Use a longer timeout in dev so a slow SSL handshake doesn't trigger
    // a misleading "Can't reach database" error.
    ...(isSupabase && process.env.NODE_ENV !== "production"
      ? { connectionTimeoutMillis: 15000 }
      : {}),
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
