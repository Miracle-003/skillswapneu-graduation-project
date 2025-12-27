import nodemailer from "nodemailer"

// Gmail SMTP transporter - lazy initialized
let transporter = null

/**
 * Get or create nodemailer transporter for Gmail SMTP
 */
function getTransporter() {
  if (transporter) {
    return transporter
  }

  const smtpUser = process.env.SMTP_USER
  const smtpPassword = process.env.SMTP_PASSWORD

  if (!smtpUser || !smtpPassword) {
    console.error("[email] SMTP_USER or SMTP_PASSWORD not configured!")
    return null
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
  })

  console.log("[email] Gmail SMTP transporter initialized")
  return transporter
}

/**
 * Send verification email to user
 */
export async function sendVerificationEmail({ to, link }) {
  const ttlSec = Number(process.env.EMAIL_VERIFICATION_TTL_SECONDS || 120)
  const ttlText = ttlSec >= 60 ? `${Math.round(ttlSec / 60)} minute(s)` : `${ttlSec} seconds`

  const subject = "Verify your SkillSwap email"
  const text = `Click the link to verify your email. This link expires in ${ttlText}.\n\n${link}`
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #8B1538;">Welcome to SkillSwap NEU!</h2>
      <p>Click the button below to verify your email address.</p>
      <p><strong>This link expires in ${ttlText}.</strong></p>
      <p style="margin: 24px 0;">
        <a href="${link}" style="background-color: #8B1538; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Verify Email
        </a>
      </p>
      <p style="color: #666; font-size: 14px;">Or copy this link:<br/>${link}</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="color: #999; font-size: 12px;">SkillSwap NEU - Find Your Study Partner</p>
    </div>
  `

  const transport = getTransporter()
  if (!transport) {
    console.warn("[email] Transporter not available. Verification link:", link)
    return { queued: false, logged: true }
  }

  try {
    console.log("[email] Sending verification email to:", to)
    await transport.sendMail({
      from: `"SkillSwap NEU" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    })
    console.log("[email] Verification email sent successfully")
    return { queued: true }
  } catch (error) {
    console.error("[email] Failed to send verification email:", error.message)
    console.warn("[email] Verification link:", link)
    return { queued: false, logged: true, error: error.message }
  }
}

/**
 * Send password reset email to user
 */
export async function sendPasswordResetEmail({ to, link }) {
  const subject = "Reset your SkillSwap password"
  const text = `Click the link to reset your password. This link expires in 15 minutes.\n\n${link}`
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #8B1538;">Password Reset Request</h2>
      <p>Click the button below to reset your password.</p>
      <p><strong>This link expires in 15 minutes.</strong></p>
      <p style="margin: 24px 0;">
        <a href="${link}" style="background-color: #8B1538; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Reset Password
        </a>
      </p>
      <p style="color: #666; font-size: 14px;">Or copy this link:<br/>${link}</p>
      <p style="color: #999; font-size: 12px;">If you didn't request this, you can ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="color: #999; font-size: 12px;">SkillSwap NEU - Find Your Study Partner</p>
    </div>
  `

  const transport = getTransporter()
  if (!transport) {
    console.warn("[email] Transporter not available. Password reset link:", link)
    return { queued: false, logged: true }
  }

  try {
    console.log("[email] Sending password reset email to:", to)
    await transport.sendMail({
      from: `"SkillSwap NEU" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    })
    console.log("[email] Password reset email sent successfully")
    return { queued: true }
  } catch (error) {
    console.error("[email] Failed to send password reset email:", error.message)
    console.warn("[email] Password reset link:", link)
    return { queued: false, logged: true, error: error.message }
  }
}
