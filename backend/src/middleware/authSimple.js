import jwt from "jsonwebtoken"

export default function auth(req, res, next) {
  const header = req.headers.authorization
  if (!header) return res.status(401).json({ error: "Missing token" })
  const token = header.split(" ")[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (e) {
    return res.status(401).json({ error: "Invalid token" })
  }
}