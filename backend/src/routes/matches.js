import express from "express"
import { prisma } from "../lib/prisma.js"
import { requireAuth } from "../middleware/requireAuth.js"

const router = express.Router()

// All match routes require auth
router.use(requireAuth)

// Get matches for a user
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params
    const me = req.user.id
    if (userId !== me) {
      return res.status(403).json({ error: "Forbidden: cannot read another user's matches" })
    }

    const matches = await prisma.match.findMany({
      where: {
        OR: [{ userId1: me }, { userId2: me }],
      },
      orderBy: { createdAt: "desc" },
    })

    res.json(matches)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Create a match
router.post("/", async (req, res) => {
  try {
    const me = req.user.id
    const { userId1, userId2, compatibilityScore } = req.body || {}
    if (userId1 && userId1 !== me) {
      return res.status(403).json({ error: "Forbidden: userId1 must match the authenticated user" })
    }
    if (!userId2) return res.status(400).json({ error: "userId2 is required" })
    if (typeof compatibilityScore !== "number") {
      return res.status(400).json({ error: "compatibilityScore must be a number" })
    }

    const match = await prisma.match.create({
      data: { userId1: me, userId2, compatibilityScore },
    })

    res.status(201).json(match)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Update match status
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body || {}
    if (!status || typeof status !== "string") return res.status(400).json({ error: "status is required" })

    const me = req.user.id
    const existing = await prisma.match.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ error: "Match not found" })
    if (existing.userId1 !== me && existing.userId2 !== me) {
      return res.status(403).json({ error: "Forbidden: cannot update another user's match" })
    }

    const updated = await prisma.match.update({ where: { id }, data: { status } })
    res.json(updated)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

export default router
