import { requireAuth } from "../middleware/requireAuth.js"

// Backwards-compat shim so older imports from "../lib/authMiddleware.js" still work.
// Newer code should import from "../middleware/requireAuth.js" instead.

export function authMiddleware(req, res, next) {
  return requireAuth(req, res, next)
}

export default authMiddleware
