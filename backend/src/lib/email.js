<< 'EOF'
import nodemailer from 'nodemailer'

/**
 * Email service for sending verification emails and notifications
 */

let transporter = null

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail. com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth:  {
        user: process.env. SMTP_USER,
        pass:  process.env.SMTP_PASSWORD,
      },
    })
  }
  return transporter
}

/**
 * Send verification email
 */
export async function sendVerificationEmail({ to, link }) {
  try {
    const transport = getTransporter()
    
    const expiryMinutes = Math.floor(
      parseInt(process.env.EMAIL_VERIFICATION_TTL_SECONDS || '7200') / 60
    )

    await transport. sendMail({
      from:  `"${process.env.SMTP_FROM_NAME || 'SkillSwap NEU'}" <${process.env. SMTP_FROM_EMAIL}>`,
      to,
      subject: '✅ Verify Your SkillSwap Account',
      text: `
Hi there!

Welcome to SkillSwap! Please verify your email address by clicking the link below:

${link}

This link will expire in ${expiryMinutes} minutes. 

If you didn't create this account, please ignore this email. 

Best regards,
The SkillSwap Team
      `,
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow:  0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 20px; text-align: center; }
        . header h1 { color: #fff; margin: 0; font-size: 28px; }
        .content { padding: 40px 30px; }
        .button { display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; margin: 30px 0; }
        .center { text-align: center; }
        . footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎓 SkillSwap NEU</h1>
        </div>
        <div class="content">
            <p><strong>Hi there!</strong></p>
            <p>Welcome to SkillSwap!  Please verify your email address to activate your account.</p>
            <div class="center">
                <a href="${link}" class="button">Verify Email Address</a>
            </div>
            <p style="text-align: center; color: #777; font-size: 14px;">
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

    console.log(`[email] ✅ Verification email sent to ${to}`)
    return true
  } catch (error) {
    console.error(`[email] ❌ Failed to send to ${to}:`, error.message)
    return false
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail({ to, link }) {
  try {
    const transport = getTransporter()

    await transport. sendMail({
      from:  `"${process.env.SMTP_FROM_NAME || 'SkillSwap NEU'}" <${process.env. SMTP_FROM_EMAIL}>`,
      to,
      subject: '🔒 Reset Your SkillSwap Password',
      text: `
Hi,

We received a request to reset your SkillSwap password. 

Click the link below to reset your password: 
${link}

If you didn't request this, please ignore this email.

Best regards,
The SkillSwap Team
      `,
      html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family:  Arial, sans-serif; }
        .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 20px; text-align: center; }
        .header h1 { color: #fff; margin: 0; }
        .content { padding: 40px 30px; }
        .button { display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: #fff; text-decoration: none; padding:  14px 32px; border-radius: 8px; }
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
            <p>We received a request to reset your SkillSwap password.</p>
            <div class="center">
                <a href="${link}" class="button">Reset Password</a>
            </div>
            <p>If you didn't request this, please ignore this email.</p>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} SkillSwap NEU</p>
        </div>
    </div>
</body>
</html>
      `,
    })

    console.log(`[email] ✅ Password reset email sent to ${to}`)
    return true
  } catch (error) {
    console.error(`[email] ❌ Failed to send password reset to ${to}:`, error.message)
    return false
  }
}
EOF