import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import compression from "compression";

import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profiles.js";
import matchRoutes from "./routes/matches.js";
import messageRoutes from "./routes/messages.js";
import adminRoutes from "./routes/admin.js";
import connectionRoutes from "./routes/connections.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

/* ============================
   ✅ CORS CONFIG
============================ */
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://skillswapneu-graduation-project-1.onrender.com",
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // allow server-to-server or tools like Postman
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

/* ============================
   Middleware
============================ */
app.use(compression());
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

/* ============================
   Health Check
============================ */
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

/* ============================
   Routes
============================ */
app.use("/api/auth", authRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/connections", connectionRoutes);

/* ============================
   Error Handler
============================ */
app.use((err, req, res, next) => {
  console.error("[ERROR]", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

/* ============================
   Server
============================ */
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(
    `📧 Email service: ${process.env.RESEND_API_KEY ? "Configured ✅" : "Not configured ❌"}`,
  );
  console.log(
    `🗄️  Database: ${process.env.DATABASE_URL ? "Connected ✅" : "Not configured ❌"}`,
  );
  console.log(
    `🔐 JWT: ${process.env.JWT_SECRET ? "Configured ✅" : "Not configured ❌"}`,
  );
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
});
