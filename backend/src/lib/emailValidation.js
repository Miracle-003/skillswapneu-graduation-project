import validator from "validator"
import dns from "dns/promises"

export async function validateEmailAddress(email) {
  // Basic RFC compliance only; MX validation disabled to avoid network timeouts in prod
  if (!validator.isEmail(email)) return { ok: false, reason: "Invalid email format" }
  return { ok: true }
}
