/**
 * Unit Tests for Profiles Controller
 * 
 * Tests for the user profile management controller functions.
 */

import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { listProfiles, getProfile } from '../src/controllers/profiles.controller.js';
import { createMockRequest, createMockResponse, generateTestProfile } from './utils.js';

// Mock the Supabase module
const mockSupabase = {
  from: jest.fn()
};

jest.mock('../src/lib/supabase.js', () => ({
  supabase: mockSupabase
}));

describe('Profiles Controller', () => {
  let req;
  let res;

  beforeEach(() => {
    req = createMockRequest();
    res = createMockResponse();
    jest.clearAllMocks();
  });

  describe('listProfiles', () => {
    test('should return profiles with default pagination', async () => {
      // Arrange
      const mockProfiles = [
        generateTestProfile({ fullName: 'John Doe' }),
        generateTestProfile({ fullName: 'Jane Smith', userId: 'different-id' })
      ];

      const mockQuery = {
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: mockProfiles,
          error: null,
          count: 2
        })
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockQuery)
      });

      // Act
      await listProfiles(req, res);

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith('user_profiles');
      expect(res.json).toHaveBeenCalledWith({
        data: mockProfiles,
        count: 2,
        limit: 20,
        offset: 0
      });
    });

    test('should filter profiles by search query', async () => {
      // Arrange
      req.query = { q: 'john' };

      const mockProfiles = [generateTestProfile({ fullName: 'John Doe' })];

      const mockQuery = {
        ilike: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: mockProfiles,
          error: null,
          count: 1
        })
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockQuery)
      });

      // Act
      await listProfiles(req, res);

      // Assert
      expect(mockQuery.ilike).toHaveBeenCalledWith('full_name', '%john%');
      expect(res.json).toHaveBeenCalledWith({
        data: mockProfiles,
        count: 1,
        limit: 20,
        offset: 0
      });
    });

    test('should respect custom limit and offset', async () => {
      // Arrange
      req.query = { limit: '5', offset: '10' };

      const mockQuery = {
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: [],
          error: null,
          count: 0
        })
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockQuery)
      });

      // Act
      await listProfiles(req, res);

      // Assert
      expect(mockQuery.range).toHaveBeenCalledWith(10, 14); // offset to offset + limit - 1
      expect(res.json).toHaveBeenCalledWith({
        data: [],
        count: 0,
        limit: 5,
        offset: 10
      });
    });

    test('should enforce maximum limit of 100', async () => {
      // Arrange
      req.query = { limit: '200' };

      const mockQuery = {
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: [],
          error: null,
          count: 0
        })
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockQuery)
      });

      // Act
      await listProfiles(req, res);

      // Assert
      expect(mockQuery.range).toHaveBeenCalledWith(0, 99); // max 100 items
      expect(res.json).toHaveBeenCalledWith({
        data: [],
        count: 0,
        limit: 100,
        offset: 0
      });
    });

    test('should handle database errors', async () => {
      // Arrange
      const mockQuery = {
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database connection failed' },
          count: null
        })
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockQuery)
      });

      // Act
      await listProfiles(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Database connection failed'
      });
    });
  });

  describe('getProfile', () => {
    test('should return profile for valid user ID', async () => {
      // Arrange
      const userId = '550e8400-e29b-41d4-a716-446655440000';
      req.params = { id: userId };

      const mockProfile = generateTestProfile({ userId });

      const mockQuery = {
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: mockProfile,
          error: null
        })
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockQuery)
      });

      // Act
      await getProfile(req, res);

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith('user_profiles');
      expect(mockQuery.eq).toHaveBeenCalledWith('user_id', userId);
      expect(res.json).toHaveBeenCalledWith(mockProfile);
    });

    test('should return 404 when profile not found', async () => {
      // Arrange
      req.params = { id: 'non-existent-id' };

      const mockQuery = {
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: null,
          error: null
        })
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockQuery)
      });

      // Act
      await getProfile(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Not found' });
    });

    test('should handle database errors', async () => {
      // Arrange
      req.params = { id: 'some-id' };

      const mockQuery = {
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database query failed' }
        })
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockQuery)
      });

      // Act
      await getProfile(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Database query failed'
      });
    });
  });
});
