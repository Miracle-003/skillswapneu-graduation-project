import express from "express"
import { prisma } from "../lib/prisma.js"

const router = express.Router()

// Get matches for a user
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params

    const matches = await prisma.match.findMany({
      where: {
        OR: [{ userId1: userId }, { userId2: userId }],
      },
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

export default router
