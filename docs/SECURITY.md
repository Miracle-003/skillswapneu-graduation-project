# Security Best Practices for SkillSwap

This document outlines security best practices for developing and deploying the SkillSwap platform.

## Table of Contents
- [Authentication & Authorization](#authentication--authorization)
- [Data Protection](#data-protection)
- [Input Validation & Sanitization](#input-validation--sanitization)
- [API Security](#api-security)
- [Database Security](#database-security)
- [Secrets Management](#secrets-management)
- [Deployment Security](#deployment-security)
- [Monitoring & Logging](#monitoring--logging)

## Authentication & Authorization

### JWT Token Security

**✅ DO:**
- Use strong, randomly generated secrets (minimum 32 characters)
- Set reasonable token expiration times (e.g., 1 hour for access tokens)
- Store tokens in httpOnly cookies when possible
- Implement token refresh mechanism
- Validate tokens on every protected route

**❌ DON'T:**
- Store sensitive data in JWT payload
- Use predictable secrets or commit them to version control
- Set tokens to never expire
- Store tokens in localStorage (XSS vulnerable)

**Example:**
```javascript
// Good ✅
const token = jwt.sign(
  { id: user.id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

// Bad ❌
const token = jwt.sign(
  { id: user.id, password: user.password }, // Don't include password!
  'simple-secret', // Don't use weak secrets!
  { expiresIn: '30d' } // Too long!
);
```

### Password Security

**✅ DO:**
- Enforce strong password requirements (8+ chars, mixed case, numbers, symbols)
- Hash passwords with bcrypt or argon2 (NOT md5 or sha1)
- Use appropriate salt rounds (10-12 for bcrypt)
- Implement password reset with time-limited tokens
- Never log or display passwords

**❌ DON'T:**
- Store passwords in plain text
- Use weak hashing algorithms
- Send passwords via email
- Allow common/weak passwords

**Example:**
```javascript
import bcrypt from 'bcrypt';

// Hash password
const hash = await bcrypt.hash(password, 10);

// Verify password
const isValid = await bcrypt.compare(password, hash);
```

### Authorization

**✅ DO:**
- Implement role-based access control (RBAC)
- Verify user permissions on every protected operation
- Use the principle of least privilege
- Check ownership before allowing modifications

**Example:**
```javascript
// Check if user owns the resource
if (resource.userId !== req.user.id && req.user.role !== 'admin') {
  throw new AuthorizationError('You do not have permission to modify this resource');
}
```

## Data Protection

### HTTPS/TLS

**✅ DO:**
- Use HTTPS for all communications (enforced in production)
- Use TLS 1.2 or higher
- Redirect HTTP to HTTPS
- Use secure cookies (Secure flag)

**Example Middleware:**
```javascript
// Force HTTPS in production
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !req.secure) {
    return res.redirect('https://' + req.headers.host + req.url);
  }
  next();
});
```

### Data Encryption

**✅ DO:**
- Encrypt sensitive data at rest
- Use environment variables for encryption keys
- Encrypt database backups
- Use Supabase's built-in encryption

**❌ DON'T:**
- Store encryption keys in code
- Use outdated encryption algorithms
- Encrypt data without proper key management

## Input Validation & Sanitization

### Validate All Input

**✅ DO:**
- Validate all user input on the server side
- Use whitelist validation (allow known good, not block known bad)
- Validate data types, lengths, and formats
- Use validation libraries (validator.js, zod)

**Example:**
```javascript
import { validateEmail, validatePassword } from './utils/validation.js';

// Validate email
const emailResult = validateEmail(req.body.email);
if (!emailResult.isValid) {
  throw new ValidationError(emailResult.error);
}

// Validate password
const passwordResult = validatePassword(req.body.password);
if (!passwordResult.isValid) {
  throw new ValidationError(passwordResult.error);
}
```

### Prevent Injection Attacks

**✅ DO:**
- Use parameterized queries (Prisma/Supabase handles this)
- Sanitize user input before displaying
- Validate and sanitize file uploads
- Use Content Security Policy headers

**❌ DON'T:**
- Concatenate user input into SQL queries
- Trust user input without validation
- Execute user-provided code

**SQL Injection Prevention:**
```javascript
// Good ✅ - Using Prisma (parameterized)
const user = await prisma.user.findUnique({
  where: { email: userEmail }
});

// Bad ❌ - Raw SQL with concatenation
const user = await prisma.$queryRaw`SELECT * FROM users WHERE email = '${userEmail}'`;
```

**XSS Prevention:**
```javascript
import validator from 'validator';

// Sanitize user input
const safeBio = validator.escape(req.body.bio);
```

## API Security

### Rate Limiting

Prevent abuse by limiting request rates:

**Example:**
```javascript
import rateLimit from 'express-rate-limit';

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.'
});

// Stricter limit for authentication
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later.'
});

app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);
```

### CORS Configuration

**✅ DO:**
- Specify allowed origins (don't use `*` in production)
- Limit allowed methods
- Specify allowed headers

**Example:**
```javascript
import cors from 'cors';

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://yourdomain.com' 
    : 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

### Security Headers

**✅ DO:**
- Use Helmet.js for security headers
- Set Content Security Policy
- Enable XSS protection
- Prevent clickjacking

**Example:**
```javascript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

## Database Security

### Supabase Row Level Security (RLS)

**✅ DO:**
- Enable RLS on all tables
- Create policies for each operation (SELECT, INSERT, UPDATE, DELETE)
- Test policies thoroughly
- Use service role key only on backend

**Example Policy:**
```sql
-- Users can only view their own profile
CREATE POLICY "Users can view own profile"
ON user_profiles FOR SELECT
USING (auth.uid() = user_id);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
ON user_profiles FOR UPDATE
USING (auth.uid() = user_id);
```

### Connection Security

**✅ DO:**
- Use connection pooling
- Use non-pooling connection for migrations
- Store connection strings in environment variables
- Use SSL/TLS for database connections

**❌ DON'T:**
- Commit database credentials
- Use same credentials for dev and production
- Expose database ports publicly

## Secrets Management

### Environment Variables

**✅ DO:**
- Store all secrets in environment variables
- Use different secrets for dev/staging/production
- Rotate secrets regularly
- Use strong, randomly generated secrets

**❌ DON'T:**
- Commit `.env` files to version control
- Share secrets via email or chat
- Use simple or default secrets

**Generate Strong Secrets:**
```bash
# Generate a random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### .gitignore Configuration

Ensure `.gitignore` includes:
```
.env
.env.local
.env.*.local
*.key
*.pem
secrets/
```

## Deployment Security

### Production Checklist

**Before Deploying:**

- [ ] All environment variables set correctly
- [ ] Strong JWT_SECRET in use
- [ ] HTTPS enabled and enforced
- [ ] Rate limiting configured
- [ ] CORS properly configured (no `*` origins)
- [ ] Database RLS policies enabled
- [ ] Security headers configured
- [ ] Error messages don't expose sensitive info
- [ ] Logging configured (but not logging secrets)
- [ ] Dependencies updated and scanned
- [ ] `.env` not committed to repository

### Dependency Security

**✅ DO:**
- Regularly update dependencies
- Use `npm audit` to check for vulnerabilities
- Review security advisories
- Pin dependency versions

**Commands:**
```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Update dependencies
npm update
```

### Environment-Specific Configuration

**Production:**
```env
NODE_ENV=production
JWT_SECRET=<strong-random-secret-64-chars-min>
SUPABASE_SERVICE_ROLE_KEY=<production-service-role-key>
```

**Development:**
```env
NODE_ENV=development
JWT_SECRET=dev-secret-change-in-production
SUPABASE_SERVICE_ROLE_KEY=<dev-service-role-key>
```

## Monitoring & Logging

### What to Log

**✅ DO:**
- Log authentication attempts (success and failure)
- Log authorization failures
- Log errors and exceptions
- Log suspicious activities

**❌ DON'T:**
- Log passwords or tokens
- Log sensitive user data
- Log full request/response bodies

**Example:**
```javascript
// Good ✅
console.log('User login attempt', { 
  email: user.email, 
  success: true,
  timestamp: new Date().toISOString()
});

// Bad ❌
console.log('User login', { 
  email: user.email, 
  password: password // Never log passwords!
});
```

### Error Handling

**✅ DO:**
- Return generic error messages to clients
- Log detailed errors server-side
- Use different error messages for dev and production

**Example:**
```javascript
export function errorHandler(err, req, res, next) {
  // Log detailed error server-side
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path
  });

  // Send generic message to client in production
  const message = process.env.NODE_ENV === 'production'
    ? 'An error occurred'
    : err.message;

  res.status(err.statusCode || 500).json({
    success: false,
    error: { message }
  });
}
```

## Security Testing

### Regular Security Checks

- [ ] Test authentication flows
- [ ] Test authorization boundaries
- [ ] Test input validation
- [ ] Check for SQL injection vulnerabilities
- [ ] Check for XSS vulnerabilities
- [ ] Test rate limiting
- [ ] Review error messages for information leakage
- [ ] Audit dependencies for vulnerabilities

### Penetration Testing

Consider periodic penetration testing for:
- Authentication bypass attempts
- Authorization escalation
- Injection attacks
- Session hijacking
- CSRF attacks

## Incident Response

### If a Security Incident Occurs

1. **Immediate Actions:**
   - Identify and contain the breach
   - Revoke compromised credentials
   - Rotate all secrets/tokens
   - Document everything

2. **Investigation:**
   - Review logs for suspicious activity
   - Identify affected users/data
   - Determine attack vector

3. **Remediation:**
   - Patch vulnerabilities
   - Notify affected users
   - Update security measures
   - Document lessons learned

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Supabase Security](https://supabase.com/docs/guides/auth/row-level-security)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

## Questions or Concerns?

If you discover a security vulnerability:
1. **Do NOT** open a public issue
2. Email security@skillswap.com (or project maintainer)
3. Provide detailed information
4. Allow time for a fix before disclosure

---

**Remember:** Security is everyone's responsibility. When in doubt, ask for a security review!
