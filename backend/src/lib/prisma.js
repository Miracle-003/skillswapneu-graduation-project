import { PrismaClient } from "@prisma/client"
import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"

// Singleton pattern for Prisma Client
const globalForPrisma = globalThis || global

// For runtime, prefer the non-pooling Postgres URL.
// Reason: this app already uses a Node `pg` Pool, so using a pooler (PgBouncer)
// can be redundant and may cause TLS/cert issues depending on the provider.
const connectionString =
  process.env.SUPABASE_POSTGRES_URL_NON_POOLING ||
  process.env.SUPABASE_POSTGRES_PRISMA_URL

if (!connectionString) {
  console.error(
    "[prisma] FATAL: Set SUPABASE_POSTGRES_URL_NON_POOLING (preferred) or SUPABASE_POSTGRES_PRISMA_URL.",
  )
  process.exit(1)
}

// Optional: relax TLS validation (last resort).
// Use only if your DB endpoint presents a self-signed/invalid cert chain.
const sslNoVerify = process.env.PG_SSL_NO_VERIFY === "true"

const poolConfig = { connectionString }
if (sslNoVerify) {
  console.warn(
    "[prisma] PG_SSL_NO_VERIFY=true - TLS certificates will NOT be verified. Use only as a last resort.",
  )
  poolConfig.ssl = { rejectUnauthorized: false }
}

const pool = new Pool(poolConfig)
const adapter = new PrismaPg(pool)

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query", "error", "warn"],
    adapter,
  })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
