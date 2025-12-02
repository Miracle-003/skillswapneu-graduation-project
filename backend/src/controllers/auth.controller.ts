import type { Response } from 'express'
import type { AuthRequest } from '../middleware/auth'
import { supabaseAdmin } from '../lib/supabase-admin'

/**
 * Get the authenticated user's information
 * 
 * Retrieves the current user's profile data from Supabase authentication.
 * If the Supabase admin client is available, it fetches the complete user object
 * with all metadata. Otherwise, it returns minimal information from the JWT token.
 * 
 * @param {AuthRequest} req - Express request object with authenticated user
 * @param {Response} res - Express response object
 * 
 * @returns {Promise<Response>} JSON response containing user data
 * 
 * @example
 * // Success response (200 OK)
 * {
 *   "user": {
 *     "id": "550e8400-e29b-41d4-a716-446655440000",
 *     "email": "student@university.edu",
 *     "created_at": "2025-01-15T10:30:00Z",
 *     "user_metadata": { ... }
 *   }
 * }
 * 
 * @example
 * // Error response (401 Unauthorized)
 * {
 *   "error": "Unauthorized"
 * }
 * 
 * @throws {401} When user is not authenticated
 * @throws {400} When user data cannot be retrieved from Supabase
 */
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
