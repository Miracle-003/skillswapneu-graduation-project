import express from "express"
import crypto from "crypto"
import argon2 from "argon2"
import { prisma } from "../lib/prisma.js"
import { validateEmailAddress } from "../lib/emailValidation.js"
import { signAuthToken } from "../lib/jwt.js"
import { requireAuth } from "../middleware/requireAuth.js"

const router = express.Router()

// Helpers
function buildVerifyLink({ tokenId, secret }) {
  const base = process.env.APP_URL?.replace(/\/$/, "") || "http://localhost:3001"
  const qs = new URLSearchParams({ id: tokenId, secret })
  return `${base}/api/auth/verify?${qs.toString()}`
}

function buildResetLink({ tokenId, secret }) {
  const base = process.env.APP_URL?.replace(/\/$/, "") || "http://localhost:3000"
  const qs = new URLSearchParams({ id: tokenId, secret })
  // Send users to the frontend reset page
  return `${base}/auth/reset-password?${qs.toString()}`
}

// POST /api/auth/register
// body: { email, password, avatarUrl? }
router.post("/register", async (req, res) => {
  try {
    const { email, password, avatarUrl } = req.body || {}
    if (!email || !password) return res.status(400).json({ error: "email and password are required" })

    // Basic email checks incl. MX records
    const emailCheck = await validateEmailAddress(email)
    if (!emailCheck.ok) return res.status(400).json({ error: `Invalid email: ${emailCheck.reason}` })

    const existing = await prisma.appUser.findUnique({ where: { email } })
    let user
    if (existing) {
      user = existing
    } else {
      const passwordHash = await argon2.hash(password, { type: argon2.argon2id })
      user = await prisma.appUser.create({ data: { email, passwordHash, avatarUrl } })
    }

    // Email verification disabled for now; mark verified immediately
    if (!user.emailVerifiedAt) {
      user = await prisma.appUser.update({ where: { id: user.id }, data: { emailVerifiedAt: new Date() } })
    }

    return res.status(201).json({ message: "Account created", user: { id: user.id, email: user.email } })
    return res.status(201).json({ message: "Verification email sent", expiresInSeconds: ttlSec })
  } catch (error) {
    console.error(error)
    return res.status(400).json({ error: error.message || "Failed to register" })
  }
})

// GET /api/auth/verify?id=...&secret=...
router.get("/verify", async (req, res) => {
  try {
    const { id, secret } = req.query
    if (!id || !secret || typeof id !== "string" || typeof secret !== "string") {
      return res.status(400).json({ error: "Missing token" })
    }

    const token = await prisma.emailVerificationToken.findUnique({ where: { tokenId: id } })
    if (!token) return res.status(400).json({ error: "Invalid or expired token" })
    if (token.consumedAt) return res.status(400).json({ error: "Token already used" })
    if (token.expiresAt.getTime() < Date.now()) return res.status(400).json({ error: "Token expired" })

    const ok = await argon2.verify(token.secretHash, secret)
    if (!ok) return res.status(400).json({ error: "Invalid token" })

    await prisma.$transaction([
      prisma.appUser.update({ where: { id: token.userId }, data: { emailVerifiedAt: new Date() } }),
      prisma.emailVerificationToken.update({ where: { tokenId: id }, data: { consumedAt: new Date() } }),
    ])

    return res.json({ message: "Email verified" })
  } catch (error) {
    console.error(error)
    return res.status(400).json({ error: error.message || "Failed to verify" })
  }
})

// POST /api/auth/login
// body: { email, password }
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {}
    if (!email || !password) return res.status(400).json({ error: "email and password are required" })

    const user = await prisma.appUser.findUnique({ where: { email } })
    if (!user) return res.status(401).json({ error: "Invalid credentials" })
    if (!user.emailVerifiedAt) return res.status(401).json({ error: "Email not verified" })

    const ok = await argon2.verify(user.passwordHash, password)
    if (!ok) return res.status(401).json({ error: "Invalid credentials" })

    const token = signAuthToken({ sub: user.id, email: user.email, role: user.role })
    return res.json({ token, user: { id: user.id, email: user.email, avatarUrl: user.avatarUrl, role: user.role } })
  } catch (error) {
    console.error(error)
    return res.status(400).json({ error: error.message || "Failed to login" })
  }
})

// GET /api/auth/me (requires JWT)
router.get("/me", requireAuth, async (req, res) => {
  try {
    return res.json({ user: req.user })
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
})

// POST /api/auth/forgot
// body: { email }
router.post("/forgot", async (req, res) => {
  try {
    const { email } = req.body || {}
    if (!email) return res.status(400).json({ error: "email is required" })

    const user = await prisma.appUser.findUnique({ where: { email } })
    // Always respond 200 to avoid user enumeration
    if (!user) return res.json({ message: "If that account exists, we've emailed a reset link" })

    // Password reset email disabled for now
    return res.json({ message: "If that account exists, we've emailed a reset link" })
  } catch (error) {
    console.error(error)
    return res.status(400).json({ error: error.message || "Failed to request password reset" })
  }
})

// POST /api/auth/reset
// body: { id, secret, password }
router.post("/reset", async (req, res) => {
  try {
    const { id, secret, password } = req.body || {}
    if (!id || !secret || !password) return res.status(400).json({ error: "Missing fields" })
    if (typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" })
    }

    const token = await prisma.emailVerificationToken.findUnique({ where: { tokenId: id } })
    if (!token) return res.status(400).json({ error: "Invalid or expired token" })
    if (token.consumedAt) return res.status(400).json({ error: "Token already used" })
    if (token.expiresAt.getTime() < Date.now()) return res.status(400).json({ error: "Token expired" })

    const ok = await argon2.verify(token.secretHash, secret)
    if (!ok) return res.status(400).json({ error: "Invalid token" })

    const passwordHash = await argon2.hash(password, { type: argon2.argon2id })

    await prisma.$transaction([
      prisma.appUser.update({ where: { id: token.userId }, data: { passwordHash } }),
      prisma.emailVerificationToken.update({ where: { tokenId: id }, data: { consumedAt: new Date() } }),
    ])

    return res.json({ message: "Password updated" })
  } catch (error) {
    console.error(error)
    return res.status(400).json({ error: error.message || "Failed to reset password" })
  }
})

export default router
