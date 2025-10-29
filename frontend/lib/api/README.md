# API Layer Documentation

This folder contains the Axios-based API client for the frontend.

## Structure

\`\`\`
lib/api/
├── axios-client.ts          # Axios instance with interceptors
├── services/                # API service modules
│   ├── auth.service.ts      # Authentication endpoints
│   ├── profile.service.ts   # Profile management
│   ├── match.service.ts     # Matching system
│   └── message.service.ts   # Messaging
└── hooks/                   # React hooks for API calls
    ├── useAuth.ts           # Authentication hook
    └── useProfiles.ts       # Profiles hook
\`\`\`

## Usage Examples

### 1. Using Services Directly

\`\`\`typescript
import { authService } from '@/lib/api/services/auth.service';

// Login
const response = await authService.login({
  email: 'user@example.com',
  password: 'password123'
});

// Get profiles
import { profileService } from '@/lib/api/services/profile.service';
const profiles = await profileService.getAll();
\`\`\`

### 2. Using React Hooks (Recommended)

\`\`\`typescript
'use client';

import { useAuth } from '@/lib/api/hooks/useAuth';

export default function LoginPage() {
  const { user, loading, login } = useAuth();

  const handleLogin = async () => {
    try {
      await login('user@example.com', 'password123');
      // Redirect to dashboard
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return <button onClick={handleLogin}>Login</button>;
}
\`\`\`

### 3. Using Axios Client Directly

\`\`\`typescript
import { apiClient } from '@/lib/api/axios-client';

// Custom endpoint
const response = await apiClient.get('/custom-endpoint');
const data = await apiClient.post('/custom-endpoint', { key: 'value' });
\`\`\`

## Configuration

Set the API URL in your environment variables:

\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
\`\`\`

For production:
\`\`\`env
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app/api
\`\`\`

## Error Handling

The axios client automatically handles:
- 401 Unauthorized → Redirects to login
- Network errors → Returns error message
- Token injection → Adds Bearer token to all requests

## Best Practices

1. **Use hooks in components** - They handle loading states automatically
2. **Use services in Server Actions** - For server-side API calls
3. **Handle errors** - Always wrap API calls in try-catch
4. **Type safety** - All services have TypeScript interfaces
