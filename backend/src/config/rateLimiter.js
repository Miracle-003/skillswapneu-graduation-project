/**
 * Rate Limiting Configuration
 * 
 * This module provides rate limiting middleware to prevent abuse
 * of the SkillSwap API. Different endpoints have different limits
 * based on their sensitivity and expected usage.
 * 
 * To use this in your Express app:
 * 1. Install: npm install express-rate-limit
 * 2. Import and apply middleware
 * 
 * @example
 * import { generalLimiter, authLimiter } from './middleware/rateLimiter.js';
 * app.use('/api/', generalLimiter);
 * app.use('/api/auth/', authLimiter);
 */

// Note: This is a configuration example. You'll need to install express-rate-limit:
// npm install express-rate-limit

/**
 * General API rate limiter
 * Applies to all API routes unless overridden by more specific limiters
 * 
 * Limit: 100 requests per 15 minutes per IP
 */
export const generalLimiterConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later.'
    }
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Store in memory (consider Redis for production with multiple servers)
  // store: new RedisStore({ client: redisClient })
};

/**
 * Authentication rate limiter
 * Stricter limits for authentication endpoints to prevent brute force attacks
 * 
 * Limit: 5 requests per 15 minutes per IP
 */
export const authLimiterConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts, please try again later.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count all requests
};

/**
 * Registration rate limiter
 * Prevent mass account creation
 * 
 * Limit: 3 registrations per hour per IP
 */
export const registrationLimiterConfig = {
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many accounts created from this IP, please try again later.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
};

/**
 * Message sending rate limiter
 * Prevent spam messages
 * 
 * Limit: 30 messages per minute per user
 */
export const messageLimiterConfig = {
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'You are sending messages too quickly. Please slow down.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Key by user ID instead of IP
  keyGenerator: (req) => req.user?.id || req.ip,
};

/**
 * Password reset rate limiter
 * Prevent password reset abuse
 * 
 * Limit: 3 requests per hour per IP
 */
export const passwordResetLimiterConfig = {
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many password reset attempts. Please try again later.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
};

/**
 * File upload rate limiter
 * Prevent excessive file uploads
 * 
 * Limit: 10 uploads per hour per user
 */
export const uploadLimiterConfig = {
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many file uploads. Please try again later.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip,
};

/**
 * Search rate limiter
 * Prevent search abuse
 * 
 * Limit: 60 searches per minute per user
 */
export const searchLimiterConfig = {
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many search requests. Please slow down.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip,
};

/**
 * Example usage in Express app:
 * 
 * ```javascript
 * import rateLimit from 'express-rate-limit';
 * import { 
 *   generalLimiterConfig, 
 *   authLimiterConfig,
 *   messageLimiterConfig 
 * } from './config/rateLimiter.js';
 * 
 * // Create limiters
 * const generalLimiter = rateLimit(generalLimiterConfig);
 * const authLimiter = rateLimit(authLimiterConfig);
 * const messageLimiter = rateLimit(messageLimiterConfig);
 * 
 * // Apply limiters
 * app.use('/api/', generalLimiter);
 * app.use('/api/auth/login', authLimiter);
 * app.use('/api/auth/register', authLimiter);
 * app.use('/api/messages', messageLimiter);
 * ```
 * 
 * For production with multiple servers, use Redis:
 * 
 * ```javascript
 * import { RedisStore } from 'rate-limit-redis';
 * import { createClient } from 'redis';
 * 
 * const redisClient = createClient({
 *   url: process.env.REDIS_URL
 * });
 * 
 * await redisClient.connect();
 * 
 * const limiter = rateLimit({
 *   ...generalLimiterConfig,
 *   store: new RedisStore({
 *     client: redisClient,
 *     prefix: 'rl:',
 *   }),
 * });
 * ```
 */

// Export all configs
export default {
  general: generalLimiterConfig,
  auth: authLimiterConfig,
  registration: registrationLimiterConfig,
  message: messageLimiterConfig,
  passwordReset: passwordResetLimiterConfig,
  upload: uploadLimiterConfig,
  search: searchLimiterConfig,
};
