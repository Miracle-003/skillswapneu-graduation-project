import { apiClient } from "../axios-client"

export interface LoginData {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  avatarUrl?: string
}

export const authService = {
  // Login user
  login: async (data: LoginData) => {
    const response = await apiClient.post("/auth/login", data)
    return response.data
  },

  // Register new user
  register: async (data: RegisterData) => {
    const response = await apiClient.post("/auth/register", data)
    return response.data
  },

  // Forgot password - request reset link
  forgotPassword: async (email: string) => {
    const response = await apiClient.post("/auth/forgot", { email })
    return response.data
  },

  // Reset password using token
  resetPassword: async ({ id, secret, password }: { id: string; secret: string; password: string }) => {
    const response = await apiClient.post("/auth/reset", { id, secret, password })
    return response.data
  },

  // Get current user
  me: async () => {
    const response = await apiClient.get("/auth/me")
    return response.data
  },

  // Logout
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
    }
  },
}
