import express from "express"
import { prisma } from "../lib/prisma.js"
import { requireAuth } from "../middleware/requireAuth.js"
import { requireAdmin } from "../middleware/requireAdmin.js"

const router = express.Router()

// Protect all admin routes
router.use(requireAuth, requireAdmin)

// List app users (minimal fields)
router.get("/users", async (req, res) => {
  try {
    const users = await prisma.appUser.findMany({
      select: { id: true, email: true, role: true, createdAt: true, emailVerifiedAt: true },
      orderBy: { createdAt: "desc" },
    })
    res.json({ users })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Get single app user by id
router.get("/users/:id", async (req, res) => {
  try {
    const user = await prisma.appUser.findUnique({
      where: { id: req.params.id },
      select: { id: true, email: true, role: true, createdAt: true, emailVerifiedAt: true, avatarUrl: true },
    })
    if (!user) return res.status(404).json({ error: "User not found" })
    res.json({ user })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

export default router