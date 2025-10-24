import type { Response } from 'express'
import type { AuthRequest } from '../middleware/auth'
import { supabaseAdmin } from '../lib/supabase-admin'

export async function getAuthMe(req: AuthRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
  // If admin available, fetch full auth user; else return minimal info from token context
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin.auth.admin.getUserById(req.user.id)
    if (error || !data.user) return res.status(400).json({ error: error?.message || 'Failed to load user' })
    return res.json({ user: data.user })
  }
  return res.json({ user: { id: req.user.id, email: req.user.email } })
}
