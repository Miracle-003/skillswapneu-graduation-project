import type { Request, Response } from 'express'
import { supabase } from '../lib/supabase'

/**
 * List user profiles with optional filtering and pagination
 * 
 * Retrieves a paginated list of user profiles from the database.
 * Supports searching by full name and implements pagination with
 * configurable limit and offset.
 * 
 * @param {Request} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {string} [req.query.q] - Search query for filtering by full name (case-insensitive)
 * @param {string} [req.query.limit='20'] - Maximum number of results to return (max: 100)
 * @param {string} [req.query.offset='0'] - Number of results to skip for pagination
 * @param {Response} res - Express response object
 * 
 * @returns {Promise<Response>} JSON response with profiles, count, and pagination info
 * 
 * @example
 * // Request: GET /api/profiles?q=john&limit=10&offset=0
 * 
 * // Success response (200 OK)
 * {
 *   "data": [
 *     {
 *       "user_id": "550e8400-e29b-41d4-a716-446655440000",
 *       "full_name": "John Doe",
 *       "major": "Computer Science",
 *       "year": "3",
 *       "bio": "Passionate about algorithms",
 *       "learning_style": "visual",
 *       "study_preference": "group",
 *       "interests": ["AI", "Web Development"],
 *       "created_at": "2025-01-15T10:30:00Z",
 *       "updated_at": "2025-01-15T14:20:00Z"
 *     }
 *   ],
 *   "count": 1,
 *   "limit": 10,
 *   "offset": 0
 * }
 * 
 * @throws {400} When database query fails
 */
export async function listProfiles(req: Request, res: Response) {
  const { q, limit = '20', offset = '0' } = req.query as Record<string, string>

  let query = supabase.from('user_profiles').select('*', { count: 'exact' }).order('updated_at', { ascending: false })

  if (q) {
    query = query.ilike('full_name', `%${q}%`)
  }

  const l = Math.min(parseInt(String(limit)) || 20, 100)
  const o = parseInt(String(offset)) || 0
  const { data, error, count } = await query.range(o, o + l - 1)
  if (error) return res.status(400).json({ error: error.message })
  return res.json({ data, count, limit: l, offset: o })
}

/**
 * Get a specific user profile by ID
 * 
 * Retrieves detailed information about a single user profile.
 * This endpoint can be used to view public profile information
 * for other users in the platform.
 * 
 * @param {Request} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - User ID (UUID format)
 * @param {Response} res - Express response object
 * 
 * @returns {Promise<Response>} JSON response with profile data
 * 
 * @example
 * // Request: GET /api/profiles/550e8400-e29b-41d4-a716-446655440000
 * 
 * // Success response (200 OK)
 * {
 *   "user_id": "550e8400-e29b-41d4-a716-446655440000",
 *   "full_name": "John Doe",
 *   "major": "Computer Science",
 *   "year": "3",
 *   "bio": "Passionate about algorithms and data structures",
 *   "learning_style": "visual",
 *   "study_preference": "group",
 *   "interests": ["Algorithms", "Web Development", "Machine Learning"],
 *   "created_at": "2025-01-15T10:30:00Z",
 *   "updated_at": "2025-01-15T14:20:00Z"
 * }
 * 
 * @example
 * // Error response (404 Not Found)
 * {
 *   "error": "Not found"
 * }
 * 
 * @throws {400} When database query fails
 * @throws {404} When user profile doesn't exist
 */
export async function getProfile(req: Request, res: Response) {
  const { id } = req.params
  const { data, error } = await supabase.from('user_profiles').select('*').eq('user_id', id).maybeSingle()
  if (error) return res.status(400).json({ error: error.message })
  if (!data) return res.status(404).json({ error: 'Not found' })
  return res.json(data)
}
