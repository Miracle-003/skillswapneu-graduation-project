/**
 * Jest configuration for SkillSwap Backend
 * 
 * This configuration sets up Jest for testing ES modules in Node.js.
 * It includes coverage reporting and test environment settings.
 */
export default {
  // Use Node environment for testing
  testEnvironment: 'node',

  // Transform settings for ES modules
  transform: {},

  // File extensions to consider
  moduleFileExtensions: ['js', 'ts', 'json'],

  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.(test|spec).js',
    '**/?(*.)+(spec|test).js'
  ],

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/**/*.d.ts',
    '!src/**/index.js',
    '!**/node_modules/**'
  ],

  // Coverage thresholds (optional, can be adjusted)
  coverageThresholds: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },

  // Coverage reporters
  coverageReporters: ['text', 'lcov', 'html'],

  // Setup files to run before tests
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/'
  ],

  // Clear mocks between tests
  clearMocks: true,

  // Automatically restore mock state between tests
  restoreMocks: true,

  // Verbose output
  verbose: true
};
