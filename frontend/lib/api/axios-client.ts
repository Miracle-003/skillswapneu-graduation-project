import axios from "axios"

// Resolve baseURL with sane fallbacks and normalization
function resolveBaseURL() {
  const apiEnv = (process.env.NEXT_PUBLIC_API_URL || "").trim()
  if (apiEnv) return apiEnv.replace(/\/+$/, "")
  const backend = (process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || "").trim()
  if (backend) return backend.replace(/\/+$/, "") + "/api"
  return "/api"
}

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: resolveBaseURL(),
  // Increase timeout to accommodate cold starts on serverless hosts
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor - add auth token if available
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage or cookies
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor - handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token")
        window.location.href = "/auth/login"
      }
    }

    return Promise.reject(error)
  },
)
