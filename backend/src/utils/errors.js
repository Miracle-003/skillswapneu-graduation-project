/**
 * Error Handling Utilities
 * 
 * This module provides standardized error handling for the SkillSwap API.
 * It includes custom error classes and helper functions for consistent
 * error responses.
 */

/**
 * Custom API Error class
 * Extends the built-in Error class with HTTP status code and error code
 */
export class APIError extends Error {
  /**
   * Create an API error
   * 
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {string} [code] - Error code for client handling
   * @param {Object} [details] - Additional error details
   * 
   * @example
   * throw new APIError('User not found', 404, 'USER_NOT_FOUND');
   */
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    
    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation Error
 * Used for input validation failures
 */
export class ValidationError extends APIError {
  /**
   * @param {string} message - Validation error message
   * @param {Object} [details] - Validation error details (field-level errors)
   * 
   * @example
   * throw new ValidationError('Invalid input', {
   *   email: 'Invalid email format',
   *   password: 'Password too short'
   * });
   */
  constructor(message = 'Validation failed', details = null) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

/**
 * Authentication Error
 * Used for authentication failures
 */
export class AuthenticationError extends APIError {
  /**
   * @param {string} [message] - Authentication error message
   * 
   * @example
   * throw new AuthenticationError('Invalid credentials');
   */
  constructor(message = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization Error
 * Used for permission/access control failures
 */
export class AuthorizationError extends APIError {
  /**
   * @param {string} [message] - Authorization error message
   * 
   * @example
   * throw new AuthorizationError('Insufficient permissions');
   */
  constructor(message = 'Insufficient permissions') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'AuthorizationError';
  }
}

/**
 * Not Found Error
 * Used when a requested resource doesn't exist
 */
export class NotFoundError extends APIError {
  /**
   * @param {string} [resource] - Resource type that wasn't found
   * 
   * @example
   * throw new NotFoundError('User');
   */
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

/**
 * Conflict Error
 * Used for resource conflicts (e.g., duplicate email)
 */
export class ConflictError extends APIError {
  /**
   * @param {string} [message] - Conflict error message
   * 
   * @example
   * throw new ConflictError('Email already exists');
   */
  constructor(message = 'Resource conflict') {
    super(message, 409, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

/**
 * Rate Limit Error
 * Used when rate limit is exceeded
 */
export class RateLimitError extends APIError {
  /**
   * @param {string} [message] - Rate limit error message
   * 
   * @example
   * throw new RateLimitError('Too many requests');
   */
  constructor(message = 'Rate limit exceeded. Please try again later.') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
    this.name = 'RateLimitError';
  }
}

/**
 * Express error handler middleware
 * Catches all errors and sends standardized error responses
 * 
 * @param {Error} err - Error object
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 * @param {NextFunction} next - Express next function
 * 
 * @example
 * // In your Express app
 * app.use(errorHandler);
 */
export function errorHandler(err, req, res, next) {
  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method
  });

  // Default to 500 server error
  let statusCode = 500;
  let errorCode = 'INTERNAL_ERROR';
  let message = 'An unexpected error occurred';
  let details = null;

  // Handle known error types
  if (err instanceof APIError) {
    statusCode = err.statusCode;
    errorCode = err.code;
    message = err.message;
    details = err.details;
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorCode = 'INVALID_TOKEN';
    message = 'Invalid authentication token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorCode = 'TOKEN_EXPIRED';
    message = 'Authentication token expired';
  } else if (err.code === '23505') {
    // PostgreSQL unique constraint violation
    statusCode = 409;
    errorCode = 'DUPLICATE_ENTRY';
    message = 'Resource already exists';
  } else if (err.code === '23503') {
    // PostgreSQL foreign key violation
    statusCode = 400;
    errorCode = 'INVALID_REFERENCE';
    message = 'Referenced resource does not exist';
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: message,
      ...(details && { details }),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
}

/**
 * Async handler wrapper
 * Wraps async route handlers to catch errors and pass to error middleware
 * 
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function
 * 
 * @example
 * app.get('/users', asyncHandler(async (req, res) => {
 *   const users = await getUsers();
 *   res.json(users);
 * }));
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Send success response
 * Helper function for consistent success responses
 * 
 * @param {Response} res - Express response object
 * @param {*} data - Response data
 * @param {number} [statusCode=200] - HTTP status code
 * @param {string} [message] - Optional success message
 * 
 * @example
 * sendSuccess(res, { user: userData }, 201, 'User created successfully');
 */
export function sendSuccess(res, data, statusCode = 200, message = null) {
  const response = {
    success: true,
    ...(message && { message }),
    ...(data !== undefined && { data })
  };

  res.status(statusCode).json(response);
}

/**
 * Send error response
 * Helper function for consistent error responses
 * 
 * @param {Response} res - Express response object
 * @param {string} message - Error message
 * @param {number} [statusCode=400] - HTTP status code
 * @param {string} [code] - Error code
 * @param {Object} [details] - Additional details
 * 
 * @example
 * sendError(res, 'Invalid email', 400, 'VALIDATION_ERROR', { field: 'email' });
 */
export function sendError(res, message, statusCode = 400, code = 'BAD_REQUEST', details = null) {
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details && { details })
    }
  });
}
