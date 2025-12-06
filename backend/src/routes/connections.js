import express from "express"
import { prisma } from "../lib/prisma.js"
import { requireAuth } from "../middleware/requireAuth.js"

const router = express.Router()
router.use(requireAuth)

// List connections for a user (accepted or pending)
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params
    const status = String(req.query.status || "") || undefined
    const where = {
      OR: [{ userId1: userId }, { userId2: userId }],
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
    const { userId1, userId2, status = "pending" } = req.body || {}
    if (!userId1 || !userId2) return res.status(400).json({ error: "userId1 and userId2 are required" })
    const conn = await prisma.connection.create({ data: { userId1, userId2, status } })
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
    await prisma.connection.delete({ where: { id } })
    res.status(204).send()
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

export default router
