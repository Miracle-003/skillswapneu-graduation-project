import { apiClient } from "../axios-client"

export interface CreateMatchData {
  userId1: string
  userId2: string
  compatibilityScore: number
}

export const matchService = {
  // Get matches for a user
  getUserMatches: async (userId: string) => {
    const response = await apiClient.get(`/matches/user/${userId}`)
    return response.data
  },

  // Create a new match
  create: async (data: CreateMatchData) => {
    const response = await apiClient.post("/matches", data)
    return response.data
  },

  // Update match status
  updateStatus: async (matchId: string, status: string) => {
    const response = await apiClient.patch(`/matches/${matchId}`, { status })
    return response.data
  },
}
