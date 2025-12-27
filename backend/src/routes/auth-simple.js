/**
 * ⚠️ SECURITY WARNING: THIS FILE IS DISABLED FOR SECURITY REASONS ⚠️
 * 
 * This route bypasses the secure email verification flow and is DISABLED by default.
 * 
 * SECURITY ISSUES WITH THIS ROUTE:
 * ================================
 * ❌ Creates users without email verification
 * ❌ Allows login without checking emailVerifiedAt field
 * ❌ Bypasses the secure authentication flow with Argon2 hashing
 * ❌ No single-use token verification
 * ❌ No token expiration checks
 * ❌ Vulnerable to account takeover attacks
 * ❌ Violates email ownership verification requirements
 * 
 * WHY EMAIL VERIFICATION IS CRITICAL:
 * ===================================
 * 1. Prevents unauthorized account creation with someone else's email
 * 2. Verifies email ownership before granting access
 * 3. Protects against spam and bot registrations
 * 4. Ensures users can recover their accounts via email
 * 5. Required for compliance with security best practices
 * 
 * PROPER AUTHENTICATION FLOW:
 * ==========================
 * All authentication MUST use the secure routes in /api/auth:
 * 
 * Registration Flow:
 * 1. POST /api/auth/register - Creates user with unverified email
 *    - Hashes password with bcrypt (10 rounds)
 *    - Generates single-use verification token
 *    - Hashes token secret with Argon2id
 *    - Sends verification email with time-limited link
 * 
 * 2. GET /api/auth/verify?id=...&secret=... - Verifies email
 *    - Validates token hasn't been consumed
 *    - Checks token hasn't expired
 *    - Verifies Argon2 hashed secret
 *    - Sets emailVerifiedAt timestamp
 *    - Marks token as consumed (single-use)
 * 
 * 3. POST /api/auth/login - Authenticates user
 *    - Checks emailVerifiedAt is set
 *    - Verifies password (supports bcrypt and Argon2)
 *    - Issues JWT with role-based claims
 *    - Returns user profile data
 * 
 * WHEN TO USE THIS ROUTE (DEVELOPMENT ONLY):
 * ==========================================
 * This route should ONLY be enabled for local development/testing when:
 * - Email service is not configured
 * - Running automated integration tests
 * - Quick prototyping without email setup
 * 
 * ENABLING FOR DEVELOPMENT (NOT RECOMMENDED):
 * ===========================================
 * To enable this route, ALL of the following are required:
 * 
 * 1. Set environment variable: ENABLE_UNSAFE_AUTH_SIMPLE=true
 * 2. Only works on localhost (IP whitelist middleware)
 * 3. Rate limited to 5 requests per hour per IP
 * 4. Prominent warnings logged on every request
 * 5. Must uncomment route handlers below
 * 6. Register route in src/index.js (currently not registered)
 * 
 * PRODUCTION DEPLOYMENT:
 * =====================
 * This route MUST NEVER be enabled in production:
 * - Will fail security audits
 * - Violates email verification requirements
 * - Opens vulnerability to account takeover
 * - May violate data protection regulations
 * 
 * FOR MORE INFO:
 * ==============
 * See /backend/src/routes/auth.js for the secure implementation
 * See /backend/README.md for setup instructions with email verification
 */

import express from "express"
// The following imports are commented out because the route handlers are disabled.
// If you need to enable this route (NOT RECOMMENDED), uncomment these imports:
// import bcrypt from "bcrypt"
// import jwt from "jsonwebtoken"
// import { prisma } from "../lib/prisma.js"

const router = express.Router()

/**
 * Extract client IP address, handling proxies and reverse proxies
 * Prioritizes X-Forwarded-For header for better proxy support
 */
function getClientIp(req) {
  // Check X-Forwarded-For header (proxy/load balancer)
  const forwarded = req.headers["x-forwarded-for"]
  if (forwarded) {
    // X-Forwarded-For can contain multiple IPs, take the first one
    const ips = forwarded.split(",").map(ip => ip.trim())
    if (ips[0]) return ips[0]
  }
  
  // Check X-Real-IP header (nginx proxy)
  const realIp = req.headers["x-real-ip"]
  if (realIp) return realIp
  
  // Fallback to direct connection IP
  // Note: req.ip is populated by Express when 'trust proxy' is enabled
  return req.ip || req.socket?.remoteAddress || "unknown"
}

/**
 * Development-only security middleware
 * Only allows requests from localhost when ENABLE_UNSAFE_AUTH_SIMPLE=true
 */
const developmentOnlyMiddleware = (req, res, next) => {
  // Check environment variable
  if (process.env.ENABLE_UNSAFE_AUTH_SIMPLE !== "true") {
    console.error("⚠️  [auth-simple] BLOCKED: Route disabled. Set ENABLE_UNSAFE_AUTH_SIMPLE=true to enable (NOT RECOMMENDED)")
    return res.status(403).json({
      error: "This authentication route is disabled for security reasons",
      message: "Please use /api/auth/register and /api/auth/login with email verification",
    })
  }

  // IP whitelist - only allow localhost
  const ip = getClientIp(req)
  const isLocalhost = ip === "127.0.0.1" || ip === "::1" || ip === "::ffff:127.0.0.1"
  
  if (!isLocalhost) {
    console.error(`⚠️  [auth-simple] BLOCKED: Non-localhost IP attempted access: ${ip}`)
    return res.status(403).json({
      error: "This route is only available from localhost",
    })
  }

  // Log warning on every request
  console.warn("⚠️  ⚠️  ⚠️  [auth-simple] SECURITY WARNING: Using insecure auth-simple route")
  console.warn("⚠️  This bypasses email verification and should ONLY be used for local development")
  console.warn("⚠️  Use /api/auth routes for production authentication")
  
  next()
}

/**
 * Simple rate limiting for development
 * Limits to 5 requests per hour per IP
 */
const rateLimitMap = new Map()
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour
const RATE_LIMIT_MAX = 5
const CLEANUP_INTERVAL = 15 * 60 * 1000 // Clean up every 15 minutes
let cleanupIntervalId = null

// Lazy initialization of cleanup interval to avoid running when route is disabled
function ensureCleanupInterval() {
  if (!cleanupIntervalId) {
    cleanupIntervalId = setInterval(() => {
      const now = Date.now()
      for (const [ip, requests] of rateLimitMap.entries()) {
        const validRequests = requests.filter(time => now - time < RATE_LIMIT_WINDOW)
        if (validRequests.length === 0) {
          rateLimitMap.delete(ip)
        } else {
          rateLimitMap.set(ip, validRequests)
        }
      }
    }, CLEANUP_INTERVAL)
    
    // Allow process to exit gracefully by not keeping it alive with this interval
    cleanupIntervalId.unref()
  }
}

const rateLimitMiddleware = (req, res, next) => {
  const ip = getClientIp(req)
  const now = Date.now()
  
  // Start cleanup interval on first use
  ensureCleanupInterval()
  
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, [])
  }
  
  const requests = rateLimitMap.get(ip).filter(time => now - time < RATE_LIMIT_WINDOW)
  
  if (requests.length >= RATE_LIMIT_MAX) {
    console.error(`⚠️  [auth-simple] RATE LIMIT: IP ${ip} exceeded ${RATE_LIMIT_MAX} requests per hour`)
    return res.status(429).json({
      error: "Rate limit exceeded",
      message: `Maximum ${RATE_LIMIT_MAX} requests per hour`,
    })
  }
  
  requests.push(now)
  rateLimitMap.set(ip, requests)
  next()
}

// Apply security middleware to all routes
router.use(developmentOnlyMiddleware)
router.use(rateLimitMiddleware)

/**
 * ⚠️ ROUTE HANDLERS DISABLED - UNCOMMENT TO ENABLE (NOT RECOMMENDED) ⚠️
 * 
 * These routes are commented out to prevent accidental use.
 * DO NOT uncomment unless you understand the security implications.
 */

/*
// POST /api/auth-simple/register
router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body || {}
    if (!email || !password) return res.status(400).json({ error: "email and password are required" })

    const exists = await prisma.appUser.findUnique({ where: { email } })
    if (exists) return res.status(400).json({ error: "Email already in use" })

    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.appUser.create({
      data: { email, passwordHash: hashed },
    })

    // Optionally capture name into profile if provided
    if (name) {
      try {
        await prisma.userProfile.upsert({
          where: { userId: user.id },
          update: { fullName: name },
          create: { userId: user.id, fullName: name },
        })
      } catch (e) {
        // Non-fatal if profile table not present yet
        console.warn("[auth-simple] profile upsert failed:", e?.message)
      }
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" })
    res.json({ token, user })
  } catch (err) {
    console.error(err)
    res.status(400).json({ error: err.message || "Failed to register" })
  }
})

// POST /api/auth-simple/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {}
    if (!email || !password) return res.status(400).json({ error: "email and password are required" })

    const user = await prisma.appUser.findUnique({ where: { email } })
    if (!user) return res.status(400).json({ error: "Invalid credentials" })

    const match = await bcrypt.compare(password, user.passwordHash)
    if (!match) return res.status(400).json({ error: "Invalid credentials" })

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" })
    res.json({ token, user })
  } catch (err) {
    console.error(err)
    res.status(400).json({ error: err.message || "Failed to login" })
  }
})
*/

export default router
