/**
 * Test Utilities and Helpers
 * 
 * This module provides reusable test utilities for the SkillSwap backend tests.
 */

import jwt from 'jsonwebtoken';

/**
 * Generate a test JWT token for authentication testing
 * 
 * @param {Object} payload - Token payload
 * @param {string} payload.id - User ID
 * @param {string} payload.email - User email
 * @param {string} [payload.role='user'] - User role
 * @param {Object} [options={}] - JWT sign options
 * @returns {string} JWT token
 * 
 * @example
 * const token = generateTestToken({ 
 *   id: '123', 
 *   email: 'test@example.com' 
 * });
 */
export function generateTestToken(payload, options = {}) {
  const secret = process.env.JWT_SECRET || 'test-secret';
  const defaultPayload = {
    id: payload.id || 'test-user-id',
    email: payload.email || 'test@example.com',
    role: payload.role || 'user'
  };
  
  return jwt.sign(
    { ...defaultPayload, ...payload },
    secret,
    { expiresIn: '1h', ...options }
  );
}

/**
 * Create a mock Express request object
 * 
 * @param {Object} overrides - Properties to override
 * @returns {Object} Mock request object
 * 
 * @example
 * const req = createMockRequest({
 *   params: { id: '123' },
 *   query: { limit: '10' },
 *   body: { name: 'Test' }
 * });
 */
export function createMockRequest(overrides = {}) {
  return {
    params: {},
    query: {},
    body: {},
    headers: {},
    user: null,
    ...overrides
  };
}

/**
 * Create a mock Express response object
 * 
 * @returns {Object} Mock response object with spy methods
 * 
 * @example
 * const res = createMockResponse();
 * await handler(req, res);
 * expect(res.json).toHaveBeenCalledWith({ success: true });
 */
export function createMockResponse() {
  const res = {
    statusCode: 200,
    data: null,
    headers: {}
  };

  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockImplementation((data) => {
    res.data = data;
    return res;
  });
  res.send = jest.fn().mockImplementation((data) => {
    res.data = data;
    return res;
  });
  res.setHeader = jest.fn().mockImplementation((key, value) => {
    res.headers[key] = value;
    return res;
  });

  return res;
}

/**
 * Create mock Supabase client for testing
 * 
 * @returns {Object} Mock Supabase client
 * 
 * @example
 * const supabase = createMockSupabase();
 * supabase.from.mockReturnValue({
 *   select: jest.fn().mockResolvedValue({ data: [], error: null })
 * });
 */
export function createMockSupabase() {
  return {
    from: jest.fn(),
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      admin: {
        getUserById: jest.fn(),
        deleteUser: jest.fn()
      }
    }
  };
}

/**
 * Wait for a specified amount of time
 * Useful for testing async operations and timeouts
 * 
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>}
 * 
 * @example
 * await sleep(1000); // Wait 1 second
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate a test user profile object
 * 
 * @param {Object} overrides - Properties to override
 * @returns {Object} Test user profile
 * 
 * @example
 * const profile = generateTestProfile({ 
 *   fullName: 'John Doe',
 *   major: 'Computer Science'
 * });
 */
export function generateTestProfile(overrides = {}) {
  return {
    userId: '550e8400-e29b-41d4-a716-446655440000',
    fullName: 'Test User',
    email: 'test@university.edu',
    major: 'Computer Science',
    year: '3',
    bio: 'Test bio',
    learningStyle: 'visual',
    studyPreference: 'group',
    interests: ['Algorithms', 'Web Development'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  };
}

/**
 * Assert that a response has the expected status and data
 * 
 * @param {Object} res - Mock response object
 * @param {number} expectedStatus - Expected HTTP status code
 * @param {Object} [expectedData] - Expected response data (optional)
 * 
 * @example
 * assertResponse(res, 200, { success: true });
 */
export function assertResponse(res, expectedStatus, expectedData) {
  expect(res.status).toHaveBeenCalledWith(expectedStatus);
  
  if (expectedData !== undefined) {
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining(expectedData)
    );
  }
}

/**
 * Assert that a response contains an error
 * 
 * @param {Object} res - Mock response object
 * @param {number} expectedStatus - Expected HTTP status code
 * @param {string} [errorMessage] - Expected error message substring
 * 
 * @example
 * assertError(res, 404, 'Not found');
 */
export function assertError(res, expectedStatus, errorMessage) {
  expect(res.status).toHaveBeenCalledWith(expectedStatus);
  expect(res.json).toHaveBeenCalled();
  
  if (errorMessage) {
    const responseData = res.json.mock.calls[0][0];
    expect(responseData.error).toContain(errorMessage);
  }
}
