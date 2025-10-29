import express from "express"
import { prisma } from "../lib/prisma.js"

const router = express.Router()

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
    const { userId, ...profileData } = req.body

    const profile = await prisma.userProfile.upsert({
      where: { userId },
      update: profileData,
      create: { userId, ...profileData },
    })

    res.json(profile)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

export default router
