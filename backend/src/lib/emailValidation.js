import validator from "validator"
import dns from "dns/promises"

export async function validateEmailAddress(email) {
  // Basic RFC compliance
  if (!validator.isEmail(email)) return { ok: false, reason: "Invalid email format" }
  const domain = email.split("@")[1]
  try {
    const mx = await dns.resolveMx(domain)
    if (!mx || mx.length === 0) return { ok: false, reason: "Domain has no MX records" }
  } catch (e) {
    return { ok: false, reason: "Domain MX lookup failed" }
  }
  // Heuristic: if gmail.com, assume Google-managed; else just pass MX check
  return { ok: true }
}