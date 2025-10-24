import type { Response } from 'express'
import type { AuthRequest } from '../middleware/auth'
import { supabase } from '../lib/supabase'
import { profileUpdateSchema } from '../schemas/profile.schema'

export async function getMe(req: AuthRequest, res: Response) {
  const userId = req.user!.id
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) return res.status(400).json({ error: error.message })
  if (!data) return res.status(404).json({ error: 'Profile not found' })
  return res.json(data)
}

export async function updateMe(req: AuthRequest, res: Response) {
  const userId = req.user!.id
  const parsed = profileUpdateSchema.safeParse(req.body)
  if (!parsed.success) return res.status(422).json({ error: 'Validation failed', issues: parsed.error.issues })

  const payload = { ...parsed.data, updated_at: new Date().toISOString() }
  const { data, error } = await supabase
    .from('user_profiles')
    .update(payload)
    .eq('user_id', userId)
    .select('*')
    .maybeSingle()

  if (error) return res.status(400).json({ error: error.message })
  return res.json(data)
}
