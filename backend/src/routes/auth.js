import express from "express"
import crypto from "crypto"
import argon2 from "argon2"
import bcrypt from "bcrypt"
import { prisma } from "../lib/prisma.js"
import { validateEmailAddress } from "../lib/emailValidation.js"
import { signAuthToken } from "../lib/jwt.js"
import { requireAuth } from "../lib/authMiddleware.js"
import { sendVerificationEmail, sendPasswordResetEmail } from "../lib/email.js"

const router = express.Router()

// Helpers
function buildVerifyLink({ tokenId, secret }) {
  const base = process.env.APP_URL?.replace(/\/$/, "") || "http://localhost:3000"
  const qs = new URLSearchParams({ id: tokenId, secret })
  return `${base}/auth/verify?${qs.toString()}`
}

function buildResetLink({ tokenId, secret }) {
  const base = process.env.APP_URL?.replace(/\/$/, "") || "http://localhost:3000"
  const qs = new URLSearchParams({ id: tokenId, secret })
  return `${base}/auth/reset-password?${qs.toString()}`
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { email, password, avatarUrl } = req.body || {}
    console.log("[auth] register start", { email })
    if (!email || !password) return res.status(400).json({ error: "email and password are required" })

    const emailCheck = await validateEmailAddress(email)
    console.log("[auth] email validated", emailCheck)
    if (!emailCheck.ok) return res.status(400).json({ error: `Invalid email: ${emailCheck.reason}` })

    const existing = await prisma.appUser.findUnique({ where: { email } })
    console.log("[auth] existing?", !!existing)

    let user
    if (existing) {
      if (existing.emailVerifiedAt) {
        return res.status(400).json({ error: "Email already registered and verified. Please login." })
      }
      user = existing
    } else {
      const passwordHash = await bcrypt.hash(password, 10)
      console.log("[auth] password hashed (bcrypt)")
      user = await prisma.appUser.create({ data: { email, passwordHash, avatarUrl } })
      console.log("[auth] user created", { id: user.id })
    }

    // Create verification token (single-use)
    const tokenId = crypto.randomUUID()
    const secret = crypto.randomBytes(32).toString("base64url")
    const secretHash = await argon2.hash(secret, { type: argon2.argon2id })
    const ttlSec = Number(process.env.EMAIL_VERIFICATION_TTL_SECONDS || 120)
    const expiresAt = new Date(Date.now() + ttlSec * 1000)
    const linkUrl = buildVerifyLink({ tokenId, secret })

    await prisma.emailVerificationToken.deleteMany({
      where: { userId: user.id, consumedAt: null },
    })

    await prisma.emailVerificationToken.create({
      data: { tokenId, secretHash, userId: user.id, email: user.email, linkUrl, expiresAt },
    })

    // Fire-and-forget email (do not block response)
    sendVerificationEmail({ to: user.email, link: linkUrl }).catch((e) => {
      console.warn("[auth] send verification email failed:", e?.message || e)
    })

    console.log("[auth] register done", { id: user.id, linkUrl })
    return res.status(201).json({ message: "Verification email sent", expiresInSeconds: ttlSec })
  } catch (error) {
    console.error("[auth] register error", error)
    return res.status(400).json({ error: error.message || "Failed to register" })
  }
})

// GET /api/auth/verify?id=...&secret=...
router.get("/verify", async (req, res) => {
  try {
    const { id, secret } = req.query
    console.log("[auth] verify attempt", { id })

    if (!id || !secret || typeof id !== "string" || typeof secret !== "string") {
      return res.status(400).json({ error: "Missing token" })
    }

    const token = await prisma.emailVerificationToken.findUnique({ where: { tokenId: id } })
    if (!token) {
      console.log("[auth] verify failed: token not found")
      return res.status(400).json({ error: "Invalid or expired token" })
    }
    if (token.consumedAt) {
      console.log("[auth] verify failed: token already used")
      return res.status(400).json({ error: "Token already used" })
    }
    if (token.expiresAt.getTime() < Date.now()) {
      console.log("[auth] verify failed: token expired")
      return res.status(400).json({ error: "Token expired" })
    }

    const ok = await argon2.verify(token.secretHash, secret)
    if (!ok) {
      console.log("[auth] verify failed: invalid secret")
      return res.status(400).json({ error: "Invalid token" })
    }

    await prisma.$transaction([
      prisma.appUser.update({ where: { id: token.userId }, data: { emailVerifiedAt: new Date() } }),
      prisma.emailVerificationToken.update({ where: { tokenId: id }, data: { consumedAt: new Date() } }),
    ])

    console.log("[auth] verify success for user", token.userId)
    return res.json({ message: "Email verified successfully! You can now login." })
  } catch (error) {
    console.error("[auth] verify error", error)
    return res.status(400).json({ error: error.message || "Failed to verify" })
  }
})

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {}
    console.log("[auth] login attempt", { email })

    if (!email || !password) return res.status(400).json({ error: "email and password are required" })

    const user = await prisma.appUser.findUnique({ where: { email } })
    if (!user) {
      console.log("[auth] login failed: user not found")
      return res.status(401).json({ error: "Invalid credentials" })
    }
    if (!user.emailVerifiedAt) {
      console.log("[auth] login failed: email not verified")
      return res.status(401).json({ error: "Email not verified. Please check your inbox for the verification link." })
    }

    let ok = false
    if (user.passwordHash?.startsWith("$argon2")) {
      ok = await argon2.verify(user.passwordHash, password)
    } else {
      ok = await bcrypt.compare(password, user.passwordHash)
    }
    if (!ok) {
      console.log("[auth] login failed: wrong password")
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const token = signAuthToken({ sub: user.id, email: user.email, role: user.role })
    console.log("[auth] login success", { id: user.id })
    return res.json({ token, user: { id: user.id, email: user.email, avatarUrl: user.avatarUrl, role: user.role } })
  } catch (error) {
    console.error("[auth] login error", error)
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
router.post("/forgot", async (req, res) => {
  try {
    const { email } = req.body || {}
    console.log("[auth] forgot password request", { email })

    if (!email) return res.status(400).json({ error: "email is required" })

    const user = await prisma.appUser.findUnique({ where: { email } })
    // Always respond 200 to avoid user enumeration
    if (!user) {
      console.log("[auth] forgot: user not found (returning generic message)")
      return res.json({ message: "If that account exists, we've emailed a reset link" })
    }

    const tokenId = crypto.randomUUID()
    const secret = crypto.randomBytes(32).toString("base64url")
    const secretHash = await argon2.hash(secret, { type: argon2.argon2id })
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)
    const linkUrl = buildResetLink({ tokenId, secret })

    // Delete any existing unused reset tokens for this user
    await prisma.emailVerificationToken.deleteMany({
      where: { userId: user.id, consumedAt: null },
    })

    await prisma.emailVerificationToken.create({
      data: { tokenId, secretHash, userId: user.id, email: user.email, linkUrl, expiresAt },
    })

    sendPasswordResetEmail({ to: user.email, link: linkUrl }).catch((e) =>
      console.warn("[auth] send reset email failed:", e?.message || e),
    )

    console.log("[auth] forgot: reset link created", { linkUrl })
    return res.json({ message: "If that account exists, we've emailed a reset link" })
  } catch (error) {
    console.error("[auth] forgot error", error)
    return res.status(400).json({ error: error.message || "Failed to request password reset" })
  }
})

// POST /api/auth/reset
router.post("/reset", async (req, res) => {
  try {
    const { id, secret, password } = req.body || {}
    console.log("[auth] reset password attempt", { id })

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

    console.log("[auth] reset password success for user", token.userId)
    return res.json({ message: "Password updated successfully" })
  } catch (error) {
    console.error("[auth] reset error", error)
    return res.status(400).json({ error: error.message || "Failed to reset password" })
  }
})

export default router
