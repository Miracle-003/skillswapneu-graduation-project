# Backend Tests

This directory contains unit and integration tests for the SkillSwap backend API.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (automatically re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

```
tests/
├── setup.js                      # Test environment setup
├── utils.js                      # Test utilities and helpers
├── auth.controller.test.js       # Authentication controller tests
├── profiles.controller.test.js   # Profile controller tests
└── README.md                     # This file
```

## Writing Tests

### Basic Test Example

```javascript
import { describe, test, expect, beforeEach } from '@jest/globals';
import { myFunction } from '../src/myModule.js';

describe('MyModule', () => {
  beforeEach(() => {
    // Setup before each test
  });

  test('should do something', () => {
    // Arrange
    const input = 'test';

    // Act
    const result = myFunction(input);

    // Assert
    expect(result).toBe('expected output');
  });
});
```

### Testing Controllers

Use the test utilities to create mock requests and responses:

```javascript
import { createMockRequest, createMockResponse } from './utils.js';

test('should return user profile', async () => {
  const req = createMockRequest({
    params: { id: 'user-123' }
  });
  const res = createMockResponse();

  await getProfile(req, res);

  expect(res.json).toHaveBeenCalledWith(
    expect.objectContaining({
      userId: 'user-123'
    })
  );
});
```

### Mocking Supabase

```javascript
const mockSupabase = {
  from: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: mockData,
        error: null
      })
    })
  })
};

jest.mock('../src/lib/supabase.js', () => ({
  supabase: mockSupabase
}));
```

## Test Utilities

The `utils.js` file provides helpful utilities:

- **`generateTestToken(payload, options)`** - Create JWT tokens for auth testing
- **`createMockRequest(overrides)`** - Create Express request mocks
- **`createMockResponse()`** - Create Express response mocks with spies
- **`createMockSupabase()`** - Create Supabase client mocks
- **`generateTestProfile(overrides)`** - Generate test user profiles
- **`assertResponse(res, status, data)`** - Assert response matches expected values
- **`assertError(res, status, message)`** - Assert error responses
- **`sleep(ms)`** - Wait for async operations

## Best Practices

### 1. Use Arrange-Act-Assert Pattern

```javascript
test('should validate email format', () => {
  // Arrange - Set up test data
  const email = 'invalid-email';

  // Act - Execute the function
  const result = validateEmail(email);

  // Assert - Verify the result
  expect(result).toBe(false);
});
```

### 2. Test One Thing Per Test

```javascript
// Good ✅
test('should return 404 when user not found', () => {
  // Test only the 404 scenario
});

test('should return user when found', () => {
  // Test only the success scenario
});

// Bad ❌
test('should handle all user scenarios', () => {
  // Testing too many things
});
```

### 3. Use Descriptive Test Names

```javascript
// Good ✅
test('should return 401 when authentication token is missing', () => {});

// Bad ❌
test('auth test', () => {});
```

### 4. Clean Up After Tests

```javascript
describe('MyTests', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mock data
  });

  afterEach(() => {
    // Clean up resources
  });
});
```

### 5. Mock External Dependencies

```javascript
// Mock database calls
jest.mock('../src/lib/prisma.js');

// Mock API calls
jest.mock('../src/lib/supabase.js');

// Mock email services
jest.mock('../src/lib/email.js');
```

## Coverage Goals

We aim for:
- **Statements**: 80%
- **Branches**: 75%
- **Functions**: 80%
- **Lines**: 80%

View coverage report:
```bash
npm run test:coverage
open coverage/index.html  # macOS
xdg-open coverage/index.html  # Linux
```

## Continuous Integration

Tests run automatically on:
- Pull requests
- Commits to main branch
- Before deployment

Make sure all tests pass before submitting a PR!

## Troubleshooting

### Tests failing with "Cannot find module"

Make sure you're using the correct import syntax for ES modules:
```javascript
import { myFunction } from '../src/myModule.js'; // Include .js extension
```

### Tests hanging or timing out

Increase the timeout:
```javascript
jest.setTimeout(10000); // 10 seconds
```

Or for individual tests:
```javascript
test('slow test', async () => {
  // test code
}, 15000); // 15 second timeout
```

### Mocks not working

Make sure mocks are set up before importing the module being tested:
```javascript
// Set up mock first
jest.mock('../src/lib/supabase.js');

// Then import module
import { myFunction } from '../src/myModule.js';
```

## Need Help?

- Check the [Jest documentation](https://jestjs.io/docs/getting-started)
- See [CONTRIBUTING.md](../CONTRIBUTING.md) for general guidelines
- Ask in our [Discord](https://discord.gg/skillswap) #testing channel
