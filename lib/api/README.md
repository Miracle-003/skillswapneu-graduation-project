# API Client Documentation

## Setup

1. Set your backend URL in environment variables:
   \`\`\`
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   \`\`\`

2. For production, update to your deployed backend URL:
   \`\`\`
   NEXT_PUBLIC_API_URL=https://your-backend.vercel.app/api
   \`\`\`

## Usage Examples

### Simple API Call
\`\`\`typescript
import { api } from '@/lib/api/client'

// In an async function or useEffect
const users = await api.users.getAll()
\`\`\`

### With React Hook (Easiest!)
\`\`\`typescript
import { useApi } from '@/lib/api/hooks'
import { api } from '@/lib/api/client'

function MyComponent() {
  const { data: users, loading, error } = useApi(() => api.users.getAll())
  
  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  
  return <div>{users.map(user => ...)}</div>
}
\`\`\`

### Manual Fetch with Loading State
\`\`\`typescript
const [loading, setLoading] = useState(false)

async function handleSubmit() {
  setLoading(true)
  try {
    await api.profiles.update(userId, formData)
    alert('Success!')
  } catch (error) {
    alert('Error: ' + error.message)
  } finally {
    setLoading(false)
  }
}
\`\`\`

## Why This Approach?

1. **No extra dependencies** - Uses native fetch
2. **Type-safe** - TypeScript support
3. **Centralized** - All API calls in one place
4. **Easy to use** - Simple hooks for components
5. **School-project friendly** - Easy to explain and understand
