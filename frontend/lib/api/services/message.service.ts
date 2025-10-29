import { apiClient } from "../axios-client"

export interface SendMessageData {
  senderId: string
  receiverId: string
  content: string
}

export const messageService = {
  // Get messages between two users
  getConversation: async (userId1: string, userId2: string) => {
    const response = await apiClient.get(`/messages/${userId1}/${userId2}`)
    return response.data
  },

  // Send a message
  send: async (data: SendMessageData) => {
    const response = await apiClient.post("/messages", data)
    return response.data
  },

  // Mark message as read
  markAsRead: async (messageId: string) => {
    const response = await apiClient.patch(`/messages/${messageId}/read`)
    return response.data
  },
}
