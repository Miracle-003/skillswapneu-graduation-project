import express from "express"
import { prisma } from "../lib/prisma.js"

const router = express.Router()

// Register
router.post("/register", async (req, res) => {
  try {
    const { email, name, password } = req.body

    // In production, hash password with bcrypt
    const user = await prisma.user.create({
      data: { email, name },
    })

    res.status(201).json({ user })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    })

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    res.json({ user })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

export default router
