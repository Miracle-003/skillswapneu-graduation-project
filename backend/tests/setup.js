/**
 * Jest Test Setup
 * 
 * This file runs before all tests and sets up the testing environment.
 * It configures environment variables and global test utilities.
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-do-not-use-in-production';
process.env.PORT = '3002';

// Mock console methods to reduce noise in tests (optional)
// Uncomment if you want cleaner test output
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
// };

// Global test timeout
jest.setTimeout(10000);

console.log('🧪 Test environment initialized');
