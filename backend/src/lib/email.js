import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Send verification email using Resend
 */
export async function sendVerificationEmail({ to, link }) {
  try {
    const expiryMinutes = Math.floor(
      parseInt(process.env.EMAIL_VERIFICATION_TTL_SECONDS || '7200') / 60
    )

    const { data, error } = await resend.emails.send({
      from: 'SkillSwap NEU <onboarding@resend.dev>',
      to: [to],
      subject: '✅ Verify Your SkillSwap Account',
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 20px; text-align: center; }
        .header h1 { color: #fff; margin: 0; font-size: 28px; font-weight: 600; }
        .content { padding: 40px 30px; }
        .button { display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #fff !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .center { text-align: center; }
        .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; }
        .expiry { text-align: center; color: #777; font-size: 14px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎓 SkillSwap NEU</h1>
        </div>
        <div class="content">
            <p><strong>Hi there!</strong></p>
            <p>Welcome to SkillSwap! Please verify your email address to activate your account.</p>
            <div class="center">
                <a href="${link}" class="button">Verify Email Address</a>
            </div>
            <p class="expiry">
                ⏱️ This link expires in <strong>${expiryMinutes} minutes</strong>
            </p>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} SkillSwap NEU - Northeastern University</p>
        </div>
    </div>
</body>
</html>
      `,
    })

    if (error) {
      console.error('[email] ❌ Resend error:', error)
      return false
    }

    console.log(`[email] ✅ Verification email sent to ${to}`)
    return true
  } catch (error) {
    console.error(`[email] ❌ Failed to send to ${to}:`, error.message)
    return false
  }
}

/**
 * Send password reset email using Resend
 */
export async function sendPasswordResetEmail({ to, link }) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'SkillSwap NEU <onboarding@resend.dev>',
      to: [to],
      subject: '🔒 Reset Your SkillSwap Password',
      html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 20px; text-align: center; }
        .header h1 { color: #fff; margin: 0; font-size: 28px; }
        .content { padding: 40px 30px; }
        .button { display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: #fff !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; }
        .center { text-align: center; }
        .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔒 Password Reset</h1>
        </div>
        <div class="content">
            <p><strong>Password Reset Request</strong></p>
            <p>We received a request to reset your SkillSwap password.</p>
            <div class="center">
                <a href="${link}" class="button">Reset Password</a>
            </div>
            <p style="margin-top: 30px; color: #666;">If you didn't request this, you can safely ignore this email.</p>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} SkillSwap NEU</p>
        </div>
    </div>
</body>
</html>
      `,
    })

    if (error) {
      console.error('[email] ❌ Resend error:', error)
      return false
    }

    console.log(`[email] ✅ Password reset email sent to ${to}`)
    return true
  } catch (error) {
    console.error(`[email] ❌ Failed to send password reset to ${to}:`, error.message)
    return false
  }
}