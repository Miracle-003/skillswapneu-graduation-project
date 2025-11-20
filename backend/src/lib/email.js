
// Optional MailerSend HTTP API integration (preferred if MAILERSEND_API_KEY is set)
async function sendViaMailerSend({ to, subject, text, html }) {
  const apiKey = process.env.MAILERSEND_API_KEY
  const from = process.env.MAILERSEND_FROM || process.env.SMTP_FROM || "no-reply@example.com"
  if (!apiKey) return { used: false }

  const controller = new AbortController()
  const timeoutMs = Number(process.env.EMAIL_SEND_TIMEOUT_MS || 10000)
  const t = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch("https://api.mailersend.com/v1/email", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        from: { email: from },
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
      console.warn("[email] MailerSend API send failed", res.status, body)
      return { used: true, queued: false }
    }
    return { used: true, queued: true }
  } catch (e) {
    console.warn("[email] MailerSend API error:", e?.message || e)
    return { used: true, queued: false }
  }
}


export async function sendVerificationEmail({ to, link }) {
  const from = process.env.MAILERSEND_FROM || process.env.SMTP_FROM || "no-reply@example.com"
  const subject = "Verify your SkillSwap email"
  const ttlSec = Number(process.env.EMAIL_VERIFICATION_TTL_SECONDS || 120)
  const ttlText = ttlSec >= 60 ? `${Math.round(ttlSec / 60)} minute(s)` : `${ttlSec} seconds`
  const text = `Click the link to verify your email. This link expires in ${ttlText}.\n\n${link}`
  const html = `<p>Click the link to verify your email. This link expires in <strong>${ttlText}</strong>.</p><p><a href="${link}">Verify Email</a></p>`

  // MailerSend API only; if not available, log link
  const ms = await sendViaMailerSend({ to, subject, text, html })
  if (!ms.used || !ms.queued) {
    console.warn("[email] MailerSend not configured or failed. Verification link:", link)
    return { queued: false, logged: true }
  }
  return { queued: true }
}

export async function sendPasswordResetEmail({ to, link }) {
  const from = process.env.MAILERSEND_FROM || process.env.SMTP_FROM || "no-reply@example.com"
  const subject = "Reset your SkillSwap password"
  const text = `Click the link to reset your password. This link expires in 15 minutes.\n\n${link}`
  const html = `<p>Click the link below to reset your password. This link expires in <strong>15 minutes</strong>.</p><p><a href="${link}">Reset Password</a></p>`

  // MailerSend API only; if not available, log link
  const ms = await sendViaMailerSend({ to, subject, text, html })
  if (!ms.used || !ms.queued) {
    console.warn("[email] MailerSend not configured or failed. Password reset link:", link)
    return { queued: false, logged: true }
  }
  return { queued: true }
}
