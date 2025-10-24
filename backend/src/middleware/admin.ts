import type { Request, Response, NextFunction } from 'express'
import { requireAuth, AuthRequest } from './auth'

const adminEmails = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean)

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  // First, ensure the user is authenticated
  return requireAuth(req as AuthRequest, res, () => {
    const email = (req as AuthRequest).user?.email?.toLowerCase()
    if (!email || !adminEmails.includes(email)) {
      return res.status(403).json({ error: 'Forbidden: admin only' })
    }
    next()
  })
}
