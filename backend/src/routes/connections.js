import express from "express"
import { prisma } from "../lib/prisma.js"
import { requireAuth } from "../middleware/requireAuth.js"

const router = express.Router()
router.use(requireAuth)

/**
 * Helper function to find a connection between two users (bidirectional)
 * Checks both (userId1, userId2) and (userId2, userId1) combinations
 */
async function findConnectionBetweenUsers(userId1, userId2) {
  return await prisma.connection.findFirst({
    where: {
      OR: [
        { userId1, userId2 },
        { userId1: userId2, userId2: userId1 },
      ],
    },
  })
}

/**
 * List connections for a user (accepted or pending)
 * Connections represent mutual acceptance, similar to Facebook's 'friends'
 * Match suggestions are stored separately in the matches table
 */
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params
    const me = req.user.id
    if (userId !== me) {
      return res.status(403).json({ error: "Forbidden: cannot read another user's connections" })
    }
    const status = String(req.query.status || "") || undefined
    const where = {
      OR: [{ userId1: me }, { userId2: me }],
      ...(status ? { status } : {}),
    }
    const connections = await prisma.connection.findMany({ where, orderBy: { createdAt: "desc" } })
    res.json({ connections })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

/**
 * Create connection (accept a match)
 * This is called when a user accepts a match suggestion
 * A connection represents mutual acceptance between two users
 */
router.post("/", async (req, res) => {
  try {
    const me = req.user.id
    const { userId1, userId2, status = "pending" } = req.body || {}
    if (userId1 && userId1 !== me) {
      return res.status(403).json({ error: "Forbidden: userId1 must match the authenticated user" })
    }
    if (!userId2) return res.status(400).json({ error: "userId2 is required" })
    
    // Check if connection already exists (bidirectional)
    const existing = await findConnectionBetweenUsers(me, userId2)

    if (existing) {
      // If connection already exists, update its status
      const updated = await prisma.connection.update({
        where: { id: existing.id },
        data: { status },
      })
      return res.json(updated)
    }

    // Create new connection
    const conn = await prisma.connection.create({ data: { userId1: me, userId2, status } })
    
    // Update match status if it exists
    try {
      const match = await prisma.match.findFirst({
        where: {
          OR: [
            { userId1: me, userId2 },
            { userId1: userId2, userId2: me },
          ],
        },
      })
      if (match) {
        await prisma.match.update({
          where: { id: match.id },
          data: { status: status === "accepted" ? "connected" : "pending_connection" },
        })
      }
    } catch (matchErr) {
      console.warn("[Connection Route] Failed to update match status:", matchErr)
      // Don't fail the connection creation if match update fails
    }

    res.status(201).json(conn)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

/**
 * Update connection status
 * Use this to accept/reject a connection request
 */
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body || {}
    if (!status || typeof status !== "string") return res.status(400).json({ error: "status is required" })

    const me = req.user.id
    const existing = await prisma.connection.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ error: "Connection not found" })
    if (existing.userId1 !== me && existing.userId2 !== me) {
      return res.status(403).json({ error: "Forbidden: cannot update another user's connection" })
    }
    const updated = await prisma.connection.update({ where: { id }, data: { status } })
    
    // Update corresponding match status
    try {
      const match = await prisma.match.findFirst({
        where: {
          OR: [
            { userId1: existing.userId1, userId2: existing.userId2 },
            { userId1: existing.userId2, userId2: existing.userId1 },
          ],
        },
      })
      if (match) {
        await prisma.match.update({
          where: { id: match.id },
          data: { status: status === "accepted" ? "connected" : status },
        })
      }
    } catch (matchErr) {
      console.warn("[Connection Route] Failed to update match status:", matchErr)
    }
    
    res.json(updated)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

/**
 * Delete connection
 * This removes a connection between two users
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const me = req.user.id
    const existing = await prisma.connection.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ error: "Connection not found" })
    if (existing.userId1 !== me && existing.userId2 !== me) {
      return res.status(403).json({ error: "Forbidden: cannot delete another user's connection" })
    }
    await prisma.connection.delete({ where: { id } })
    
    // Revert match status back to suggestion
    try {
      const match = await prisma.match.findFirst({
        where: {
          OR: [
            { userId1: existing.userId1, userId2: existing.userId2 },
            { userId1: existing.userId2, userId2: existing.userId1 },
          ],
        },
      })
      if (match) {
        await prisma.match.update({
          where: { id: match.id },
          data: { status: "suggestion" },
        })
      }
    } catch (matchErr) {
      console.warn("[Connection Route] Failed to update match status:", matchErr)
    }
    
    res.status(204).send()
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

export default router
