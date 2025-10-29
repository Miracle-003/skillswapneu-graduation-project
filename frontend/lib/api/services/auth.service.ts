import { apiClient } from "../axios-client"

export interface LoginData {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  name: string
  password: string
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
