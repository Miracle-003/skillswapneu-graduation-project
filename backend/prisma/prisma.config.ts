import { defineConfig, env } from 'prisma/config'

// Environment variables used for database connection
// Make sure these are set in Render and in your local .env (if you use one)
// - SUPABASE_POSTGRES_PRISMA_URL
// - SUPABASE_POSTGRES_URL_NON_POOLING

type Env = {
  SUPABASE_POSTGRES_PRISMA_URL: string
  SUPABASE_POSTGRES_URL_NON_POOLING: string
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env<Env>('SUPABASE_POSTGRES_PRISMA_URL'),
    directUrl: env<Env>('SUPABASE_POSTGRES_URL_NON_POOLING'),
  },
})
