# Disabled Routes

This document tracks routes that have been intentionally disabled for security reasons.

## `/api/auth-simple` - Email Verification Bypass Route

**Status:** DISABLED  
**Date Disabled:** 2025-12-27  
**Files Affected:**
- `backend/src/routes/auth-simple.js` (route handlers commented out)
- `backend/src/index.js` (import and registration commented out)

### Reason for Disabling

The `/api/auth-simple` route provides authentication endpoints (`/register` and `/login`) that bypass the email verification process. This creates a significant security vulnerability in the application's authentication model.

### Security Risks

1. **Unauthorized Account Creation**
   - Allows users to create accounts without verifying email ownership
   - Enables attackers to register with any email address, including addresses they don't control
   - Opens potential for account takeover attacks using other users' email addresses

2. **Spam and Abuse**
   - No barrier to mass account creation for spam or malicious purposes
   - Allows bots to create fake accounts without email verification challenges
   - Enables creation of disposable accounts for abuse

3. **Data Integrity**
   - Undermines trust in email addresses stored in the database
   - Makes it impossible to reliably contact users via their registered email
   - Compromises features that depend on verified email addresses

4. **System Security Model**
   - Violates the application's security principle that all users must verify their identity
   - Creates an inconsistent security posture with two authentication paths
   - May be exploited to bypass rate limiting or IP restrictions on the main auth route

### Recommended Authentication Flow

All authentication **must** go through `/api/auth` which implements:

1. **Registration** (`POST /api/auth/register`)
   - Creates user account
   - Generates secure, time-limited verification token
   - Sends verification email with unique link
   - Prevents login until email is verified

2. **Email Verification** (`GET /api/auth/verify`)
   - Validates the verification token
   - Marks email as verified in the database
   - One-time use token prevents replay attacks

3. **Login** (`POST /api/auth/login`)
   - Checks email is verified before allowing login
   - Returns error if email not verified
   - Issues JWT token only for verified users

### Safe Re-enablement Conditions

The `/api/auth-simple` route should only be re-enabled if **ALL** of the following conditions are met:

1. **Development Environment Only**
   - Route must be completely disabled in production
   - Environment variable check (e.g., `NODE_ENV !== 'production'`)
   - Clear visual indicators in development mode

2. **IP Whitelist**
   - Restrict to localhost (127.0.0.1) or specific development IP ranges
   - Implement middleware to verify request origin
   - Log all access attempts with IP addresses

3. **Rate Limiting**
   - Strict rate limiting (e.g., 3 requests per hour per IP)
   - Account creation throttling per email domain
   - CAPTCHA or similar anti-automation measures

4. **Audit Logging**
   - Log every registration and login attempt with full details
   - Alert on suspicious patterns (multiple IPs, rapid requests)
   - Retain logs for security review

5. **Code Review**
   - Security team approval required
   - Documentation of specific development need
   - Time-limited approval with regular reviews

6. **Alternative Approaches**
   - Consider mock email service for development instead
   - Use test seeds with pre-verified accounts
   - Implement a development-only auto-verify flag in the main auth route

### Migration Notes

Existing code that may have used `/api/auth-simple` should be migrated to:
- Use `/api/auth/register` for registration
- Implement email verification handling in the UI
- Use `/api/auth/login` only after email verification

### References

- Main authentication implementation: `backend/src/routes/auth.js`
- Email verification flow: Lines 26-80 in `auth.js`
- Login verification check: Lines 138-141 in `auth.js`
