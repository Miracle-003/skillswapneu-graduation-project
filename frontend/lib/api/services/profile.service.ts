import { apiClient } from "../axios-client"

export interface ProfileData {
  userId: string
  major?: string
  year?: string
  bio?: string
  courses?: string[]
  interests?: string[]
  learningStyle?: string
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

  // Create or update profile
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
