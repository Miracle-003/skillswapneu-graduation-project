import express from "express"
import { prisma } from "../lib/prisma.js"
import { supabase } from "../lib/supabase.js"

const router = express.Router()

// Register via Supabase Auth
router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    })

    if (error) return res.status(400).json({ error: error.message })

    res.status(201).json({ user: data.user })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Login via Supabase Auth - returns access token and user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !data.session) return res.status(401).json({ error: error?.message || "Invalid credentials" })

    return res.json({
      token: data.session.access_token,
      refreshToken: data.session.refresh_token,
      user: data.user,
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Get current user from Bearer token
router.get("/me", async (req, res) => {
  try {
    const auth = req.headers.authorization
    if (!auth?.startsWith("Bearer ")) return res.status(401).json({ error: "Missing bearer token" })
    const token = auth.slice(7).trim()

    const { data, error } = await supabase.auth.getUser(token)
    if (error || !data.user) return res.status(401).json({ error: "Invalid token" })

    return res.json({ user: data.user })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

export default router
