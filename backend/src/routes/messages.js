import express from "express"
import { prisma } from "../lib/prisma.js"
import { requireAuth } from "../middleware/requireAuth.js"

const router = express.Router()

// All message routes require auth
router.use(requireAuth)

// Get messages between two users
router.get("/:userId1/:userId2", async (req, res) => {
  try {
    const { userId1, userId2 } = req.params

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 },
        ],
      },
      orderBy: { createdAt: "asc" },
    })

    res.json(messages)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Send a message
router.post("/", async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body

    const message = await prisma.message.create({
      data: { senderId, receiverId, content },
    })

    res.status(201).json(message)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Mark message as read
router.patch("/:id/read", async (req, res) => {
  try {
    // Model has no 'read' field; acknowledge without DB mutation
    res.status(204).send()
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Recent messages received by a user
router.get("/recent/:userId", async (req, res) => {
  try {
    const { userId } = req.params
    const limit = Math.min(parseInt(String(req.query.limit || "20")) || 20, 100)
    const msgs = await prisma.message.findMany({
      where: { receiverId: userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    })
    res.json(msgs)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

export default router
