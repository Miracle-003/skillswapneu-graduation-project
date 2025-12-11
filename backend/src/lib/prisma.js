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

const pool = new Pool({ connectionString })
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
