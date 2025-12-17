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
    const me = req.user.id
    if (me !== userId1 && me !== userId2) {
      return res.status(403).json({ error: "Forbidden: cannot read other users' conversations" })
    }

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
    const me = req.user.id
    const { senderId, receiverId, content } = req.body || {}
    if (senderId && senderId !== me) {
      return res.status(403).json({ error: "Forbidden: senderId must match the authenticated user" })
    }
    if (!receiverId) return res.status(400).json({ error: "receiverId is required" })
    if (!content || typeof content !== "string") return res.status(400).json({ error: "content is required" })

    const message = await prisma.message.create({
      data: { senderId: me, receiverId, content },
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
    const me = req.user.id
    if (userId !== me) {
      return res.status(403).json({ error: "Forbidden: cannot read another user's inbox" })
    }
    const limit = Math.min(parseInt(String(req.query.limit || "20")) || 20, 100)
    const msgs = await prisma.message.findMany({
      where: { receiverId: me },
      orderBy: { createdAt: "desc" },
      take: limit,
    })
    res.json(msgs)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

export default router
