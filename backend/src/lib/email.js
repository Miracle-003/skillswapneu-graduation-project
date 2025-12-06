// MailerSend HTTP API integration
async function sendViaMailerSend({ to, subject, text, html }) {
  const apiKey = process.env.MAILERSEND_API_KEY
  const from = process.env.MAILERSEND_FROM || "noreply@mirr-codes.dev"

  if (!apiKey) {
    console.error("[email] MAILERSEND_API_KEY not configured!")
    return { used: false }
  }

  const controller = new AbortController()
  const timeoutMs = Number(process.env.EMAIL_SEND_TIMEOUT_MS || 10000)
  const t = setTimeout(() => controller.abort(), timeoutMs)

  try {
    console.log("[email] Sending via MailerSend to:", to, "from:", from)
    const res = await fetch("https://api.mailersend.com/v1/email", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        from: { email: from, name: "SkillSwap" },
        to: [{ email: to }],
        subject,
        text,
        html,
      }),
      signal: controller.signal,
    })
    clearTimeout(t)

    if (!res.ok) {
      const body = await res.text().catch(() => "")
      console.error("[email] MailerSend failed:", res.status, body)
      return { used: true, queued: false, error: body }
    }

    console.log("[email] MailerSend success!")
    return { used: true, queued: true }
  } catch (e) {
    clearTimeout(t)
    console.error("[email] MailerSend error:", e?.message || e)
    return { used: true, queued: false, error: e?.message }
  }
}

export async function sendVerificationEmail({ to, link }) {
  const subject = "Verify your SkillSwap email"
  const ttlSec = Number(process.env.EMAIL_VERIFICATION_TTL_SECONDS || 120)
  const ttlText = ttlSec >= 60 ? `${Math.round(ttlSec / 60)} minute(s)` : `${ttlSec} seconds`
  const text = `Click the link to verify your email. This link expires in ${ttlText}.\n\n${link}`
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #8B1538;">Welcome to SkillSwap!</h2>
      <p>Click the button below to verify your email address.</p>
      <p><strong>This link expires in ${ttlText}.</strong></p>
      <p style="margin: 24px 0;">
        <a href="${link}" style="background-color: #8B1538; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Verify Email
        </a>
      </p>
      <p style="color: #666; font-size: 14px;">Or copy this link:<br/>${link}</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="color: #999; font-size: 12px;">SkillSwap - Find Your Study Partner</p>
    </div>
  `

  console.log("[email] Sending verification email to:", to)

  const result = await sendViaMailerSend({ to, subject, text, html })

  if (result.queued) {
    return { queued: true }
  }

  // Log the link if email fails (for development/debugging)
  console.warn("[email] Failed to send. Verification link:", link)
  return { queued: false, logged: true, error: result.error }
}

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
      <p style="color: #999; font-size: 12px;">SkillSwap - Find Your Study Partner</p>
    </div>
  `

  console.log("[email] Sending password reset email to:", to)

  const result = await sendViaMailerSend({ to, subject, text, html })

  if (result.queued) {
    return { queued: true }
  }

  console.warn("[email] Failed to send. Password reset link:", link)
  return { queued: false, logged: true, error: result.error }
}
