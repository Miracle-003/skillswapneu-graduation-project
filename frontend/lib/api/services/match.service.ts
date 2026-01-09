import { apiClient } from "../axios-client";

export interface CreateMatchData {
  userId1: string;
  userId2: string;
  compatibilityScore: number;
}

export const matchService = {
  // Get matches for a user
  getUserMatches: async (userId: string, status?: string) => {
    console.log(
      "[v0] Calling /matches/user/:userId endpoint with userId:",
      userId,
      "status:",
      status,
    );
    const url = status
      ? `/matches/user/${userId}?status=${status}`
      : `/matches/user/${userId}`;
    const response = await apiClient.get(url);
    console.log("[v0] /matches/user/:userId response:", response.data);
    return response.data;
  },

  // Create a new match
  create: async (data: CreateMatchData) => {
    console.log("[v0] Calling /matches POST endpoint with data:", data);
    const response = await apiClient.post("/matches", data);
    console.log("[v0] /matches POST response:", response.data);
    return response.data;
  },

  // Update match status
  updateStatus: async (matchId: string, status: string) => {
    console.log(
      "[v0] Calling /matches/:id PATCH endpoint with matchId:",
      matchId,
      "status:",
      status,
    );
    const response = await apiClient.patch(`/matches/${matchId}`, { status });
    console.log("[v0] /matches/:id PATCH response:", response.data);
    return response.data;
  },

  regenerate: async () => {
    console.log("[v0] Calling /matches/regenerate POST endpoint");
    const response = await apiClient.post("/matches/regenerate");
    console.log("[v0] /matches/regenerate response:", response.data);
    return response.data;
  },
};
