import { createClient } from '@supabase/supabase-js'
import { env } from '../config/env'

const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

export const supabaseAdmin = SERVICE_KEY
  ? createClient(env.SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false, autoRefreshToken: false } })
  : null
