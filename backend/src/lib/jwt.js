import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me"

export function signAuthToken(payload, opts = {}) {
  const { expiresIn = "1d" } = opts
  return jwt.sign(payload, JWT_SECRET, { algorithm: "HS256", expiresIn })
}

export function verifyAuthToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] })
  } catch (err) {
    return null
  }
}