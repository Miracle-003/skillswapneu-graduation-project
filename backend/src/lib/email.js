import nodemailer from "nodemailer"

// Create a transporter from env SMTP_* or fallback to console logger
export function makeTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env
  if (!SMTP_HOST || !SMTP_PORT) {
    return null
  }
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  })
}

export async function sendVerificationEmail({ to, link }) {
  const from = process.env.SMTP_FROM || "no-reply@example.com"
  const transporter = makeTransport()
  const subject = "Verify your SkillSwap email"
  const text = `Click the link to verify your email. This link expires in 1 minute.\n\n${link}`
  const html = `<p>Click the link to verify your email. This link expires in <strong>1 minute</strong>.</p><p><a href="${link}">Verify Email</a></p>`

  if (!transporter) {
    console.warn("[email] SMTP not configured. Verification link:", link)
    return { queued: false, logged: true }
  }
  await transporter.sendMail({ from, to, subject, text, html })
  return { queued: true }
}

export async function sendPasswordResetEmail({ to, link }) {
  const from = process.env.SMTP_FROM || "no-reply@example.com"
  const transporter = makeTransport()
  const subject = "Reset your SkillSwap password"
  const text = `Click the link to reset your password. This link expires in 15 minutes.\n\n${link}`
  const html = `<p>Click the link below to reset your password. This link expires in <strong>15 minutes</strong>.</p><p><a href="${link}">Reset Password</a></p>`

  if (!transporter) {
    console.warn("[email] SMTP not configured. Password reset link:", link)
    return { queued: false, logged: true }
  }
  await transporter.sendMail({ from, to, subject, text, html })
  return { queued: true }
}
