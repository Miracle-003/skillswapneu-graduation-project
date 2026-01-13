import express from "express"
import { prisma } from "../lib/prisma.js"
import { requireAuth } from "../middleware/requireAuth.js"
import { validate as isValidUUID } from "uuid"

const router = express.Router()

// All message routes require auth
router.use(requireAuth)

// Get messages with a specific user (for current logged-in user)
router.get("/:participantId", async (req, res) => {
  try {
    const { participantId } = req.params
    const me = req.user.id
    
    // Validate UUIDs
    if (!isValidUUID(participantId)) {
      return res.status(400).json({ error: "Invalid participantId: must be a valid UUID" })
    }
    if (!isValidUUID(me)) {
      return res.status(400).json({ error: "Invalid user ID: must be a valid UUID" })
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: me, receiverId: participantId },
          { senderId: participantId, receiverId: me },
        ],
      },
      orderBy: { createdAt: "asc" },
    })
    
    // Mark all messages from participant as read
    // updateMany returns the count of updated records, so we can optimize by just calling it
    const updateResult = await prisma.message.updateMany({
      where: {
        senderId: participantId,
        receiverId: me,
        read: false
      },
      data: {
        read: true
      }
    })
    
    // Log if any messages were marked as read (optional, for debugging)
    if (updateResult.count > 0) {
      console.log(`[Messages] Marked ${updateResult.count} message(s) as read`)
    }
    
    // Enrich with sender names
    const enriched = await Promise.all(
      messages.map(async (msg) => {
        const senderProfile = await prisma.userProfile.findUnique({
          where: { userId: msg.senderId }
        })
        return {
          ...msg,
          sender_name: senderProfile?.fullName || "Unknown",
          sender_id: msg.senderId
        }
      })
    )

    res.json(enriched)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Get messages between two users
router.get("/:userId1/:userId2", async (req, res) => {
  try {
    const { userId1, userId2 } = req.params
    const me = req.user.id
    
    // Validate UUIDs
    if (!isValidUUID(userId1)) {
      return res.status(400).json({ error: "Invalid userId1: must be a valid UUID" })
    }
    if (!isValidUUID(userId2)) {
      return res.status(400).json({ error: "Invalid userId2: must be a valid UUID" })
    }
    if (!isValidUUID(me)) {
      return res.status(400).json({ error: "Invalid user ID: must be a valid UUID" })
    }
    
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
    
    // Validate UUIDs
    if (!isValidUUID(me)) {
      return res.status(400).json({ error: "Invalid user ID: must be a valid UUID" })
    }
    if (senderId && !isValidUUID(senderId)) {
      return res.status(400).json({ error: "Invalid senderId: must be a valid UUID" })
    }
    if (receiverId && !isValidUUID(receiverId)) {
      return res.status(400).json({ error: "Invalid receiverId: must be a valid UUID" })
    }
    
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
    const { id } = req.params
    const me = req.user.id
    
    // Validate UUIDs
    if (!isValidUUID(id)) {
      return res.status(400).json({ error: "Invalid message ID: must be a valid UUID" })
    }
    if (!isValidUUID(me)) {
      return res.status(400).json({ error: "Invalid user ID: must be a valid UUID" })
    }
    
    // Verify the user is the receiver of the message
    const message = await prisma.message.findUnique({
      where: { id }
    })
    
    if (!message) {
      return res.status(404).json({ error: "Message not found" })
    }
    
    if (message.receiverId !== me) {
      return res.status(403).json({ error: "Forbidden: can only mark own messages as read" })
    }
    
    // Update the message to mark it as read
    const updated = await prisma.message.update({
      where: { id },
      data: { read: true }
    })
    
    res.json(updated)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Recent messages received by a user
router.get("/recent/:userId", async (req, res) => {
  try {
    const { userId } = req.params
    const me = req.user.id
    
    // Validate UUIDs
    if (!isValidUUID(userId)) {
      return res.status(400).json({ error: "Invalid userId: must be a valid UUID" })
    }
    if (!isValidUUID(me)) {
      return res.status(400).json({ error: "Invalid user ID: must be a valid UUID" })
    }
    
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

// Get conversations (list of connections user can chat with)
router.get("/conversations", async (req, res) => {
  try {
    const me = req.user.id
    
    // Validate UUID
    if (!isValidUUID(me)) {
      return res.status(400).json({ error: "Invalid user ID: must be a valid UUID" })
    }
    
    // Get all accepted connections
    const connections = await prisma.connection.findMany({
      where: {
        OR: [
          { userId1: me, status: "accepted" },
          { userId2: me, status: "accepted" }
        ]
      }
    })
    
    // Map to conversation format with last message
    const conversations = await Promise.all(
      connections.map(async (conn) => {
        const participantId = conn.userId1 === me ? conn.userId2 : conn.userId1
        
        // Fetch participant profile separately
        const participant = await prisma.userProfile.findUnique({
          where: { userId: participantId }
        })
        
        // Get last message between these users
        const lastMessage = await prisma.message.findFirst({
          where: {
            OR: [
              { senderId: me, receiverId: participantId },
              { senderId: participantId, receiverId: me }
            ]
          },
          orderBy: { createdAt: "desc" }
        })
        
        // Count unread messages from this participant
        const unreadCount = await prisma.message.count({
          where: {
            senderId: participantId,
            receiverId: me,
            read: false
          }
        })
        
        return {
          id: participantId,
          participant_id: participantId,
          participant_name: participant?.fullName || "Unknown User",
          last_message: lastMessage?.content || "No messages yet",
          last_message_time: lastMessage?.createdAt || conn.createdAt,
          unread_count: unreadCount
        }
      })
    )
    
    res.json(conversations)
  } catch (error) {
    console.error("[Messages] Error fetching conversations:", error)
    res.status(400).json({ error: error.message })
  }
})

export default router
