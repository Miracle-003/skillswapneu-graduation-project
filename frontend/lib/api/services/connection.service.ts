import { apiClient } from "../axios-client";

export interface CreateConnectionData {
  userId1?: string;
  userId2: string;
  status?: "pending" | "accepted" | "rejected";
}

export const connectionService = {
  // Get connections for a user
  getUserConnections: async (userId: string, status?: string) => {
    console.log(
      "[v0] Calling /connections/user/:userId endpoint with userId:",
      userId,
      "status:",
      status,
    );
    const url = status
      ? `/connections/user/${userId}?status=${status}`
      : `/connections/user/${userId}`;
    const response = await apiClient.get(url);
    console.log("[v0] /connections/user/:userId response:", response.data);
    return response.data;
  },

  // Create a new connection (accept a match)
  create: async (data: CreateConnectionData) => {
    console.log("[v0] Calling /connections POST endpoint with data:", data);
    const response = await apiClient.post("/connections", data);
    console.log("[v0] /connections POST response:", response.data);
    return response.data;
  },

  // Update connection status
  updateStatus: async (connectionId: string, status: string) => {
    console.log(
      "[v0] Calling /connections/:id PUT endpoint with id:",
      connectionId,
      "status:",
      status,
    );
    const response = await apiClient.put(`/connections/${connectionId}`, {
      status,
    });
    console.log("[v0] /connections/:id PUT response:", response.data);
    return response.data;
  },

  // Delete a connection
  delete: async (connectionId: string) => {
    console.log(
      "[v0] Calling /connections/:id DELETE endpoint with id:",
      connectionId,
    );
    const response = await apiClient.delete(`/connections/${connectionId}`);
    console.log("[v0] /connections/:id DELETE response:", response.data);
    return response.data;
  },
};
