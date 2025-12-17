import express from "express"
import { prisma } from "../lib/prisma.js"
import { requireAuth } from "../middleware/requireAuth.js"

const router = express.Router()

// All profile routes require auth (JWT in Authorization header)
router.use(requireAuth)

// Get all profiles
router.get("/", async (req, res) => {
  try {
    const profiles = await prisma.userProfile.findMany()
    res.json(profiles)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Get profile by ID
router.get("/:id", async (req, res) => {
  try {
    const profile = await prisma.userProfile.findUnique({
      where: { userId: req.params.id },
    })

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" })
    }

    res.json(profile)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Create/Update profile
router.post("/", async (req, res) => {
  try {
    // Trust boundary: user identity comes only from JWT.
    const userId = req.user.id
    const suppliedUserId = req.body?.userId
    if (suppliedUserId && suppliedUserId !== userId) {
      return res.status(403).json({ error: "Forbidden: cannot modify another user's profile" })
    }

    // Whitelist fields and map from camelCase to schema fields
    const {
      fullName,
      major,
      year,
      bio,
      learningStyle,
      studyPreference,
      interests,
    } = req.body || {}

    // Ensure required fields exist for first-time profile creation.
    const existing = await prisma.userProfile.findUnique({ where: { userId } })
    if (!existing && (!fullName || typeof fullName !== "string")) {
      return res.status(400).json({ error: "fullName is required when creating your profile" })
    }

    const data = {
      ...(fullName !== undefined ? { fullName } : {}),
      ...(major !== undefined ? { major } : {}),
      ...(year !== undefined ? { year } : {}),
      ...(bio !== undefined ? { bio } : {}),
      ...(learningStyle !== undefined ? { learningStyle } : {}),
      ...(studyPreference !== undefined ? { studyPreference } : {}),
      ...(Array.isArray(interests) ? { interests } : {}),
      updatedAt: new Date(),
    }

    const profile = await prisma.userProfile.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    })

    res.json(profile)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

export default router
