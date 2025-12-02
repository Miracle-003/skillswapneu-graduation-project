/**
 * Input Validation Utilities
 * 
 * This module provides reusable validation functions for common input types
 * in the SkillSwap application. All functions return validation results
 * with helpful error messages.
 * 
 * Note: Uses validator.js library. The default import works because
 * package.json has "type": "module" for ES module support.
 */

import validator from 'validator';

/**
 * Validation result type
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether the validation passed
 * @property {string} [error] - Error message if validation failed
 */

/**
 * Validate email address format
 * 
 * @param {string} email - Email address to validate
 * @returns {ValidationResult} Validation result
 * 
 * @example
 * const result = validateEmail('user@university.edu');
 * if (!result.isValid) {
 *   console.error(result.error);
 * }
 */
export function validateEmail(email) {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }

  if (typeof email !== 'string') {
    return { isValid: false, error: 'Email must be a string' };
  }

  if (!validator.isEmail(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  return { isValid: true };
}

/**
 * Validate password strength
 * 
 * Requirements:
 * - At least 8 characters long
 * - Contains at least one uppercase letter
 * - Contains at least one lowercase letter
 * - Contains at least one number
 * - Contains at least one special character
 * 
 * @param {string} password - Password to validate
 * @returns {ValidationResult} Validation result
 * 
 * @example
 * const result = validatePassword('SecurePass123!');
 * if (!result.isValid) {
 *   console.error(result.error);
 * }
 */
export function validatePassword(password) {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }

  if (typeof password !== 'string') {
    return { isValid: false, error: 'Password must be a string' };
  }

  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long' };
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' };
  }

  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' };
  }

  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' };
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one special character' };
  }

  return { isValid: true };
}

/**
 * Validate UUID format
 * 
 * @param {string} uuid - UUID to validate
 * @returns {ValidationResult} Validation result
 * 
 * @example
 * const result = validateUUID('550e8400-e29b-41d4-a716-446655440000');
 */
export function validateUUID(uuid) {
  if (!uuid) {
    return { isValid: false, error: 'UUID is required' };
  }

  if (!validator.isUUID(uuid)) {
    return { isValid: false, error: 'Invalid UUID format' };
  }

  return { isValid: true };
}

/**
 * Validate year (academic year)
 * 
 * @param {string|number} year - Year to validate (1-4)
 * @returns {ValidationResult} Validation result
 * 
 * @example
 * const result = validateYear('3');
 */
export function validateYear(year) {
  const yearNum = typeof year === 'string' ? parseInt(year) : year;

  if (isNaN(yearNum) || yearNum < 1 || yearNum > 4) {
    return { isValid: false, error: 'Year must be between 1 and 4' };
  }

  return { isValid: true };
}

/**
 * Validate array of interests
 * 
 * @param {Array<string>} interests - Array of interest strings
 * @param {number} [minLength=1] - Minimum number of interests
 * @param {number} [maxLength=10] - Maximum number of interests
 * @returns {ValidationResult} Validation result
 * 
 * @example
 * const result = validateInterests(['AI', 'Web Development']);
 */
export function validateInterests(interests, minLength = 1, maxLength = 10) {
  if (!Array.isArray(interests)) {
    return { isValid: false, error: 'Interests must be an array' };
  }

  if (interests.length < minLength) {
    return { isValid: false, error: `At least ${minLength} interest(s) required` };
  }

  if (interests.length > maxLength) {
    return { isValid: false, error: `Maximum ${maxLength} interests allowed` };
  }

  // Check each interest is a non-empty string
  for (const interest of interests) {
    if (typeof interest !== 'string' || interest.trim().length === 0) {
      return { isValid: false, error: 'Each interest must be a non-empty string' };
    }

    if (interest.length > 50) {
      return { isValid: false, error: 'Each interest must be 50 characters or less' };
    }
  }

  return { isValid: true };
}

/**
 * Validate learning style
 * 
 * @param {string} learningStyle - Learning style to validate
 * @returns {ValidationResult} Validation result
 * 
 * @example
 * const result = validateLearningStyle('visual');
 */
export function validateLearningStyle(learningStyle) {
  const validStyles = ['visual', 'auditory', 'reading', 'kinesthetic', 'hands-on', 'practical'];

  if (!learningStyle) {
    return { isValid: false, error: 'Learning style is required' };
  }

  if (!validStyles.includes(learningStyle)) {
    return { 
      isValid: false, 
      error: `Learning style must be one of: ${validStyles.join(', ')}` 
    };
  }

  return { isValid: true };
}

/**
 * Validate study preference
 * 
 * @param {string} studyPreference - Study preference to validate
 * @returns {ValidationResult} Validation result
 * 
 * @example
 * const result = validateStudyPreference('group');
 */
export function validateStudyPreference(studyPreference) {
  const validPreferences = ['one-on-one', 'small-group', 'group', 'flexible'];

  if (!studyPreference) {
    return { isValid: false, error: 'Study preference is required' };
  }

  if (!validPreferences.includes(studyPreference)) {
    return { 
      isValid: false, 
      error: `Study preference must be one of: ${validPreferences.join(', ')}` 
    };
  }

  return { isValid: true };
}

/**
 * Validate rating (1-5 stars)
 * 
 * @param {number} rating - Rating to validate
 * @returns {ValidationResult} Validation result
 * 
 * @example
 * const result = validateRating(5);
 */
export function validateRating(rating) {
  const ratingNum = typeof rating === 'string' ? parseFloat(rating) : rating;

  if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return { isValid: false, error: 'Rating must be between 1 and 5' };
  }

  return { isValid: true };
}

/**
 * Sanitize user input to prevent XSS
 * 
 * @param {string} input - Input string to sanitize
 * @returns {string} Sanitized string
 * 
 * @example
 * const safe = sanitizeInput(userInput);
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return '';
  }

  // Use validator's escape function
  return validator.escape(input);
}

/**
 * Validate pagination parameters
 * 
 * @param {string|number} limit - Items per page
 * @param {string|number} offset - Offset for pagination
 * @returns {Object} Validated pagination params
 * 
 * @example
 * const { limit, offset } = validatePagination(req.query.limit, req.query.offset);
 */
export function validatePagination(limit, offset) {
  const parsedLimit = parseInt(limit) || 20;
  const parsedOffset = parseInt(offset) || 0;

  return {
    limit: Math.min(Math.max(parsedLimit, 1), 100), // Between 1 and 100
    offset: Math.max(parsedOffset, 0) // Non-negative
  };
}

/**
 * Validate all required fields are present
 * 
 * @param {Object} data - Data object to validate
 * @param {Array<string>} requiredFields - Array of required field names
 * @returns {ValidationResult} Validation result
 * 
 * @example
 * const result = validateRequiredFields(
 *   req.body,
 *   ['email', 'password', 'fullName']
 * );
 */
export function validateRequiredFields(data, requiredFields) {
  const missing = [];

  for (const field of requiredFields) {
    if (!data[field]) {
      missing.push(field);
    }
  }

  if (missing.length > 0) {
    return {
      isValid: false,
      error: `Missing required fields: ${missing.join(', ')}`
    };
  }

  return { isValid: true };
}
