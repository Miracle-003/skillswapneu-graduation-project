import express from "express"
import { prisma } from "../lib/prisma.js"

const router = express.Router()

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

export default router
