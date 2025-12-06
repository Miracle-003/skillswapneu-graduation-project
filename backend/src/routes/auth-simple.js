import express from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { prisma } from "../lib/prisma.js"

const router = express.Router()

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

export default router
