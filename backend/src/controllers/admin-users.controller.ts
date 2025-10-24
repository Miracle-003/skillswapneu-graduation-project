import type { Request, Response } from 'express'
import { supabaseAdmin } from '../lib/supabase-admin'

export async function listAuthUsers(req: Request, res: Response) {
  if (!supabaseAdmin) return res.status(500).json({ error: 'Service role not configured' })
  const page = Math.max(parseInt(String(req.query.page || '1')) || 1, 1)
  const perPage = Math.min(Math.max(parseInt(String(req.query.perPage || '50')) || 50, 1), 200)
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage })
  if (error) return res.status(400).json({ error: error.message })
  return res.json({ users: data.users, page, perPage })
}

export async function getAuthUser(req: Request, res: Response) {
  if (!supabaseAdmin) return res.status(500).json({ error: 'Service role not configured' })
  const { id } = req.params
  const { data, error } = await supabaseAdmin.auth.admin.getUserById(id)
  if (error || !data.user) return res.status(404).json({ error: error?.message || 'Not found' })
  return res.json({ user: data.user })
}
