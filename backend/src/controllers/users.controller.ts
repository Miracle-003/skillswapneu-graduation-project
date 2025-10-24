import type { Request, Response } from 'express'
import { supabase } from '../lib/supabase'

// These operate on a public mirror table populated by a DB trigger from auth.users
export async function listUsers(req: Request, res: Response) {
  const { q, limit = '20', offset = '0' } = req.query as Record<string, string>
  let query = supabase.from('user_accounts').select('*', { count: 'exact' }).order('created_at', { ascending: false })
  if (q) query = query.ilike('email', `%${q}%`)
  const l = Math.min(parseInt(String(limit)) || 20, 100)
  const o = parseInt(String(offset)) || 0
  const { data, error, count } = await query.range(o, o + l - 1)
  if (error) return res.status(400).json({ error: error.message })
  return res.json({ data, count, limit: l, offset: o })
}

export async function getUser(req: Request, res: Response) {
  const { id } = req.params
  const { data, error } = await supabase.from('user_accounts').select('*').eq('id', id).maybeSingle()
  if (error) return res.status(400).json({ error: error.message })
  if (!data) return res.status(404).json({ error: 'Not found' })
  return res.json(data)
}
