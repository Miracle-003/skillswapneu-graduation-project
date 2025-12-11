import { defineConfig, env } from 'prisma/config'

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
