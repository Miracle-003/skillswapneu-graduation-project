import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import dotenv from "dotenv"
import compression from "compression"
import authRoutes from "./routes/auth.js"
import profileRoutes from "./routes/profiles.js"
import matchRoutes from "./routes/matches.js"
import messageRoutes from "./routes/messages.js"
import adminRoutes from "./routes/admin.js"
import connectionRoutes from "./routes/connections.js"
// import authSimpleRoutes from "./routes/auth-simple.js" // DISABLED: Bypasses email verification - see backend/docs/DISABLED-ROUTES.md

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(compression())
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(morgan("dev"))

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})

// Routes
app.use("/api/auth", authRoutes)
// app.use("/api/auth-simple", authSimpleRoutes) // DISABLED: Bypasses email verification - see backend/docs/DISABLED-ROUTES.md
app.use("/api/profiles", profileRoutes)
app.use("/api/matches", matchRoutes)
app.use("/api/messages", messageRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/connections", connectionRoutes)

// Error handler
app.use((err, req, res, next) => {
  console.error("[ERROR]", err)
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  })
})

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on 0.0.0.0:${PORT}`)
})
