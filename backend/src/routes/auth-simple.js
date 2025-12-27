/**
 * ⚠️ SECURITY WARNING: THIS FILE IS DISABLED FOR SECURITY REASONS ⚠️
 *
 * This route bypasses the secure email verification flow and is DISABLED by default.
 *
 * DO NOT ENABLE IN PRODUCTION.
 */

import express from "express"

const router = express.Router()

/**
 * Extract client IP address safely
 */
function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"]
  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }

  return (
    req.headers["x-real-ip"] ||
    req.ip ||
    req.socket?.remoteAddress ||
    "unknown"
  )
}

/**
 * Development-only protection
 */
const developmentOnlyMiddleware = (req, res, next) => {
  if (process.env.ENABLE_UNSAFE_AUTH_SIMPLE !== "true") {
    console.error("⚠️ [auth-simple] Route disabled")

    return res.status(403).json({
      error: "This route is disabled for security reasons",
      message: "Use /api/auth routes instead",
    })
  }

  const ip = getClientIp(req)
  const allowed =
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip === "::ffff:127.0.0.1" ||
    ip === "0.0.0.0"

  if (!allowed) {
    return res.status(403).json({
      error: "This route is only available from localhost",
    })
  }

  console.warn("⚠️ USING UNSAFE AUTH ROUTE (DEV ONLY)")
  next()
}

/**
 * Rate limiting (dev only)
 */
const rateLimitMap = new Map()
const RATE_LIMIT = 5
const WINDOW = 60 * 60 * 1000

const rateLimitMiddleware = (req, res, next) => {
  const ip = getClientIp(req)
  const now = Date.now()

  const requests = rateLimitMap.get(ip) || []
  const valid = requests.filter(t => now - t < WINDOW)

  if (valid.length >= RATE_LIMIT) {
    return res.status(429).json({
      error: "Rate limit exceeded",
    })
  }

  valid.push(now)
  rateLimitMap.set(ip, valid)
  next()
}

// Apply protections
router.use(developmentOnlyMiddleware)
router.use(rateLimitMiddleware)

/**
 * 🚫 AUTH ROUTES ARE DISABLED
 * 
 * This file exists only to preserve structure and documentation.
 * Real authentication lives in:
 * 👉 /src/routes/auth.js
 */

// Do NOT add routes here.

export default router
