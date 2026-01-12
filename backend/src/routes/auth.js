import express from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { validateEmailAddress } from "../lib/emailValidation.js";
import { signAuthToken } from "../lib/jwt.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "../lib/email.js";

const router = express.Router();

// =========================
// Helpers
// =========================
function buildVerifyLink({ tokenId, secret }) {
  const base =
    process.env.APP_URL?.replace(/\/$/, "") || "http://localhost:3000";
  const qs = new URLSearchParams({ id: tokenId, secret });
  return `${base}/auth/verify?${qs.toString()}`;
}

function buildResetLink({ tokenId, secret }) {
  const base =
    process.env.APP_URL?.replace(/\/$/, "") || "http://localhost:3000";
  const qs = new URLSearchParams({ id: tokenId, secret });
  return `${base}/auth/reset-password?${qs.toString()}`;
}

// =========================
// POST /api/auth/register
// =========================
router.post("/register", async (req, res) => {
  try {
    const { email, password, avatarUrl } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const emailCheck = await validateEmailAddress(email);
    if (!emailCheck.ok) {
      return res
        .status(400)
        .json({ error: `Invalid email: ${emailCheck.reason}` });
    }

    const existing = await prisma.appUser.findUnique({ where: { email } });

    let user;
    if (existing) {
      if (existing.emailVerifiedAt) {
        return res
          .status(400)
          .json({ error: "Email already registered. Please login." });
      }
      user = existing;
    } else {
      const passwordHash = await bcrypt.hash(password, 10);
      user = await prisma.appUser.create({
        data: { email, passwordHash, avatarUrl },
      });
    }

    const tokenId = crypto.randomUUID();
    const secret = crypto.randomBytes(32).toString("base64url");
    const secretHash = await bcrypt.hash(secret, 10);
    const ttlSec = Number(process.env.EMAIL_VERIFICATION_TTL_SECONDS || 900);
    const expiresAt = new Date(Date.now() + ttlSec * 1000);
    const linkUrl = buildVerifyLink({ tokenId, secret });

    await prisma.emailVerificationToken.deleteMany({
      where: { userId: user.id, consumedAt: null },
    });

    await prisma.emailVerificationToken.create({
      data: {
        tokenId,
        secretHash,
        userId: user.id,
        email: user.email,
        linkUrl,
        expiresAt,
      },
    });

    sendVerificationEmail({ to: user.email, link: linkUrl }).catch(() => {});

    console.log("📧 VERIFY LINK (dev):", linkUrl);
    return res.status(201).json({ message: "Verification email sent" });
  } catch (e) {
    console.error(e);
    return res.status(400).json({ error: "Registration failed" });
  }
});

// =========================
// GET /api/auth/verify
// =========================
router.get("/verify", async (req, res) => {
  try {
    const { id, secret } = req.query;
    if (!id || !secret) return res.status(400).json({ error: "Missing token" });

    const token = await prisma.emailVerificationToken.findUnique({
      where: { tokenId: id },
    });

    if (!token || token.consumedAt || token.expiresAt.getTime() < Date.now()) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    const ok = await bcrypt.compare(secret, token.secretHash);
    if (!ok) return res.status(400).json({ error: "Invalid token" });

    await prisma.$transaction([
      prisma.appUser.update({
        where: { id: token.userId },
        data: { emailVerifiedAt: new Date() },
      }),
      prisma.emailVerificationToken.update({
        where: { tokenId: id },
        data: { consumedAt: new Date() },
      }),
    ]);

    return res.json({ message: "Email verified successfully" });
  } catch (e) {
    console.error(e);
    return res.status(400).json({ error: "Verification failed" });
  }
});

// =========================
// POST /api/auth/login
// =========================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const user = await prisma.appUser.findUnique({ where: { email } });
    if (!user || !user.emailVerifiedAt) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = signAuthToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        avatarUrl: user.avatarUrl,
        role: user.role,
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(400).json({ error: "Login failed" });
  }
});

// =========================
// GET /api/auth/me
// =========================
router.get("/me", requireAuth, (req, res) => {
  return res.json({ user: req.user });
});

// =========================
// POST /api/auth/forgot
// =========================
router.post("/forgot", async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.json({ message: "If account exists, email sent" });

    const user = await prisma.appUser.findUnique({ where: { email } });
    if (!user) return res.json({ message: "If account exists, email sent" });

    const tokenId = crypto.randomUUID();
    const secret = crypto.randomBytes(32).toString("base64url");
    const secretHash = await bcrypt.hash(secret, 10);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const linkUrl = buildResetLink({ tokenId, secret });

    await prisma.emailVerificationToken.deleteMany({
      where: { userId: user.id, consumedAt: null },
    });

    await prisma.emailVerificationToken.create({
      data: {
        tokenId,
        secretHash,
        userId: user.id,
        email: user.email,
        linkUrl,
        expiresAt,
      },
    });

    sendPasswordResetEmail({ to: user.email, link: linkUrl }).catch(() => {});
    console.log("🔑 RESET LINK (dev):", linkUrl);

    return res.json({ message: "If account exists, email sent" });
  } catch (e) {
    console.error(e);
    return res.status(400).json({ error: "Failed to request reset" });
  }
});

// =========================
// POST /api/auth/reset
// =========================
router.post("/reset", async (req, res) => {
  try {
    const { id, secret, password } = req.body || {};
    if (!id || !secret || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const token = await prisma.emailVerificationToken.findUnique({
      where: { tokenId: id },
    });

    if (!token || token.consumedAt || token.expiresAt.getTime() < Date.now()) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    const ok = await bcrypt.compare(secret, token.secretHash);
    if (!ok) return res.status(400).json({ error: "Invalid token" });

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.$transaction([
      prisma.appUser.update({
        where: { id: token.userId },
        data: { passwordHash },
      }),
      prisma.emailVerificationToken.update({
        where: { tokenId: id },
        data: { consumedAt: new Date() },
      }),
    ]);

    return res.json({ message: "Password updated successfully" });
  } catch (e) {
    console.error(e);
    return res.status(400).json({ error: "Failed to reset password" });
  }
});

export default router;
