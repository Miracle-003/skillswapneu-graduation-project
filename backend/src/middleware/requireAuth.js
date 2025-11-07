import { verifyAuthToken } from "../lib/jwt.js"

export function requireAuth(req, res, next) {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith("Bearer ")) return res.status(401).json({ error: "Missing bearer token" })
  const token = auth.slice(7).trim()
  const payload = verifyAuthToken(token)
  if (!payload) return res.status(401).json({ error: "Invalid token" })
  req.user = { id: payload.sub, email: payload.email, role: payload.role }
  next()
}
