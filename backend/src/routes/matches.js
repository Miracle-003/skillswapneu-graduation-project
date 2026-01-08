import express from "express"
import { prisma } from "../lib/prisma.js"
import { requireAuth } from "../middleware/requireAuth.js"
import { regenerateMatchesForUser } from "../lib/matchingService.js"

const router = express.Router()

// All match routes require auth
router.use(requireAuth)

/**
 * Get match suggestions for a user
 * Returns all matches where status is 'suggestion' (not yet connected)
 * These are automatically generated based on course/interest overlap
 */
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
        // Filter by status if provided, otherwise return all
        ...(req.query.status ? { status: String(req.query.status) } : {}),
      },
      orderBy: { compatibilityScore: "desc" }, // Order by score instead of createdAt
    })

    res.json(matches)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

/**
 * Create a match manually (for backward compatibility)
 * This is typically not needed as matches are auto-generated
 */
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
      data: { userId1: me, userId2, compatibilityScore, status: "suggestion" },
    })

    res.status(201).json(match)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

/**
 * Update match status
 * This is used internally but not for accepting matches - use connections for that
 */
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

/**
 * Trigger match regeneration for current user
 * This endpoint allows manual triggering of match generation
 */
router.post("/regenerate", async (req, res) => {
  try {
    const me = req.user.id
    await regenerateMatchesForUser(me)
    res.json({ message: "Match suggestions regenerated successfully" })
  } catch (error) {
    console.error("[Match Route] Error regenerating matches:", error)
    res.status(500).json({ error: "Failed to regenerate matches" })
  }
})

export default router
