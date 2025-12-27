import nodemailer from 'nodemailer';

// Gmail SMTP transporter configuration
let transporter = null;

function getTransporter() {
  if (!transporter) {
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = Number(process.env.SMTP_PORT || 587);
    const smtpUser = process.env.SMTP_USER;
    const smtpPassword = process.env.SMTP_PASSWORD;

    if (!smtpUser || !smtpPassword) {
      console.error('[email] SMTP credentials not configured!');
      return null;
    }

    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });

    console.log('[email] Gmail SMTP transporter initialized');
  }
  return transporter;
}

async function sendViaGmailSMTP({ to, subject, text, html }) {
  const transport = getTransporter();
  
  if (!transport) {
    console.error('[email] SMTP transporter not available!');
    return { used: false };
  }

  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;
  const fromName = process.env.SMTP_FROM_NAME || 'SkillSwap NEU';

  try {
    console.log('[email] Sending via Gmail SMTP to:', to, 'from:', fromEmail);
    
    const info = await transport.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      text,
      html,
    });

    console.log('[email] Gmail SMTP success! Message ID:', info.messageId);
    return { used: true, queued: true, messageId: info.messageId };
  } catch (e) {
    console.error('[email] Gmail SMTP error:', e?.message || e);
    return { used: true, queued: false, error: e?.message };
  }
}

export async function sendVerificationEmail({ to, link }) {
  const subject = "Verify your SkillSwap email"
  const ttlSec = Number(process.env.EMAIL_VERIFICATION_TTL_SECONDS || 120)
  const ttlText = ttlSec >= 60 ? `${Math.round(ttlSec / 60)} minute(s)` : `${ttlSec} seconds`
  const text = `Click the link to verify your email. This link expires in ${ttlText}.\n\n${link}`
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f5f5f5;">
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h2 style="color: #8B1538; margin-top: 0;">Welcome to SkillSwap NEU!</h2>
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Thank you for joining our community! Click the button below to verify your email address and get started.
          </p>
          <p style="color: #666; font-size: 14px;">
            <strong>This link expires in ${ttlText}.</strong>
          </p>
          <div style="margin: 32px 0; text-align: center;">
            <a href="${link}" role="button" style="background-color: #8B1538; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 16px;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            Or copy and paste this link into your browser:<br/>
            <a href="${link}" style="color: #8B1538; word-break: break-all;">${link}</a>
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="color: #999; font-size: 12px; line-height: 1.6; margin-bottom: 0;">
            SkillSwap NEU - Find Your Study Partner<br/>
            If you didn't create this account, you can safely ignore this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  console.log("[email] Sending verification email to:", to)

  const result = await sendViaGmailSMTP({ to, subject, text, html })

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
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f5f5f5;">
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h2 style="color: #8B1538; margin-top: 0;">Password Reset Request</h2>
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            We received a request to reset your password. Click the button below to create a new password.
          </p>
          <p style="color: #666; font-size: 14px;">
            <strong>This link expires in 15 minutes.</strong>
          </p>
          <div style="margin: 32px 0; text-align: center;">
            <a href="${link}" role="button" style="background-color: #8B1538; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 16px;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            Or copy and paste this link into your browser:<br/>
            <a href="${link}" style="color: #8B1538; word-break: break-all;">${link}</a>
          </p>
          <p style="color: #e53e3e; background-color: #fff5f5; padding: 12px; border-radius: 4px; font-size: 14px; line-height: 1.6;">
            <strong>⚠️ Security Notice:</strong> If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="color: #999; font-size: 12px; line-height: 1.6; margin-bottom: 0;">
            SkillSwap NEU - Find Your Study Partner<br/>
            This is an automated message, please do not reply to this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  console.log("[email] Sending password reset email to:", to)

  const result = await sendViaGmailSMTP({ to, subject, text, html })

  if (result.queued) {
    return { queued: true }
  }

  console.warn("[email] Failed to send. Password reset link:", link)
  return { queued: false, logged: true, error: result.error }
}
