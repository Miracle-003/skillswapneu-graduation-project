// API Client for communicating with Express backend
// This uses native fetch - no extra dependencies needed!

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

// Helper: get JWT from localStorage (frontend stores `auth_token`)
function getAuthToken() {
  return typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
}

// Generic API call function
async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken()

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }))
    throw new Error(error.message || `HTTP ${response.status}`)
  }

  return response.json()
}

// API methods for your backend
export const api = {
  // Auth endpoints
  auth: {
    me: () => apiCall<any>("/auth/me"),
  },

  // User endpoints
  users: {
    getAll: () => apiCall<any[]>("/users"),
    getById: (id: string) => apiCall<any>(`/users/${id}`),
  },

  // Profile endpoints
  profiles: {
    getAll: () => apiCall<any[]>("/profiles"),
    getById: (id: string) => apiCall<any>(`/profiles/${id}`),
    update: (id: string, data: any) =>
      apiCall<any>(`/profiles/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  },

  // Add more endpoints as needed
}

// Export for direct use if needed
export { apiCall }
