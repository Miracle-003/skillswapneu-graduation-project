import { PrismaClient } from "@prisma/client"
import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"

// Singleton pattern for Prisma Client
const globalForPrisma = globalThis || global

// Use the same pooled connection URL that Prisma Migrate uses
const connectionString = process.env.SUPABASE_POSTGRES_PRISMA_URL

if (!connectionString) {
  console.error("[prisma] FATAL: SUPABASE_POSTGRES_PRISMA_URL environment variable is not set!")
  process.exit(1)
}

// Optional: relax TLS validation for local dev behind intercepting proxies/VPNs
const isDev = process.env.NODE_ENV !== "production"
const sslNoVerify = process.env.PG_SSL_NO_VERIFY === "true"

const poolConfig = { connectionString }
if (sslNoVerify && isDev) {
  console.warn(
    "[prisma] PG_SSL_NO_VERIFY=true - TLS certificates will NOT be verified. Use only for local development.",
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
