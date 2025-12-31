import { apiClient } from "../axios-client"

// Shape aligned with backend /api/profiles route (see backend/src/routes/profiles.js)
export interface ProfileData {
  userId?: string
  fullName?: string
  major?: string
  year?: string
  bio?: string
  learningStyle?: string
  studyPreference?: string
  interests?: string[]
  // Legacy/extra fields kept optional for compatibility in other parts of the app
  courses?: string[]
  studyPreferences?: string[]
  availability?: string
  profilePicture?: string
}

export const profileService = {
  // Get all profiles
  getAll: async () => {
    const response = await apiClient.get("/profiles")
    return response.data
  },

  // Get profile by ID
  getById: async (id: string) => {
    const response = await apiClient.get(`/profiles/${id}`)
    return response.data
  },

  // Create or update profile for the current user (userId comes from JWT on the server)
  upsert: async (data: ProfileData) => {
    const response = await apiClient.post("/profiles", data)
    return response.data
  },

  // Delete profile
  delete: async (id: string) => {
    const response = await apiClient.delete(`/profiles/${id}`)
    return response.data
  },
}
