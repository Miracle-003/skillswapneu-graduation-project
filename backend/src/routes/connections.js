import express from "express"
import { prisma } from "../lib/prisma.js"
import { requireAuth } from "../middleware/requireAuth.js"

const router = express.Router()
router.use(requireAuth)

// List connections for a user (accepted or pending)
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

// Create connection
router.post("/", async (req, res) => {
  try {
    const me = req.user.id
    const { userId1, userId2, status = "pending" } = req.body || {}
    if (userId1 && userId1 !== me) {
      return res.status(403).json({ error: "Forbidden: userId1 must match the authenticated user" })
    }
    if (!userId2) return res.status(400).json({ error: "userId2 is required" })
    const conn = await prisma.connection.create({ data: { userId1: me, userId2, status } })
    res.status(201).json(conn)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Update connection status
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
    res.json(updated)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Delete connection
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
    res.status(204).send()
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

export default router
