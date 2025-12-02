/**
 * Unit Tests for Authentication Controller
 * 
 * Tests for the authentication-related controller functions.
 */

import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { getAuthMe } from '../src/controllers/auth.controller.js';
import { createMockRequest, createMockResponse } from './utils.js';

// Mock the Supabase admin module
jest.mock('../src/lib/supabase-admin.js', () => ({
  supabaseAdmin: null
}));

describe('Auth Controller', () => {
  let req;
  let res;

  beforeEach(() => {
    req = createMockRequest();
    res = createMockResponse();
    jest.clearAllMocks();
  });

  describe('getAuthMe', () => {
    test('should return 401 when user is not authenticated', async () => {
      // Arrange
      req.user = null;

      // Act
      await getAuthMe(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    test('should return minimal user info when supabaseAdmin is not available', async () => {
      // Arrange
      req.user = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'test@university.edu'
      };

      // Act
      await getAuthMe(req, res);

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        user: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          email: 'test@university.edu'
        }
      });
    });

    test('should handle authenticated user successfully', async () => {
      // Arrange
      const mockUser = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'test@university.edu',
        created_at: '2025-01-15T10:30:00Z'
      };

      req.user = mockUser;

      // Act
      await getAuthMe(req, res);

      // Assert
      expect(res.json).toHaveBeenCalled();
      const response = res.json.mock.calls[0][0];
      expect(response).toHaveProperty('user');
      expect(response.user).toHaveProperty('id');
      expect(response.user).toHaveProperty('email');
    });
  });
});
