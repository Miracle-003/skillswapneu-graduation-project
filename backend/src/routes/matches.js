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

    const matches = await prisma.match.findMany({
      where: {
        OR: [{ userId1: userId }, { userId2: userId }],
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
    const { userId1, userId2, compatibilityScore } = req.body

    const match = await prisma.match.create({
      data: { userId1, userId2, compatibilityScore },
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
    const { status } = req.body
    const updated = await prisma.match.update({ where: { id }, data: { status } })
    res.json(updated)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

export default router
