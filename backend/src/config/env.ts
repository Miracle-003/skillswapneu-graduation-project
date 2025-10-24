import 'dotenv/config'

const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: Number(process.env.PORT ?? 4000),
  SUPABASE_URL: process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
} as const

if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
  console.warn('Warning: Missing SUPABASE_URL or SUPABASE_ANON_KEY')
}

export { env }
