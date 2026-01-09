import { apiClient } from "../axios-client";

export interface ProfileData {
  userId?: string;
  fullName?: string;
  major?: string;
  year?: string;
  bio?: string;
  learningStyle?: string;
  studyPreference?: string;
  interests?: string[];
  courses?: string[];
  studyPreferences?: string[];
  availability?: string;
  profilePicture?: string;
}

export const profileService = {
  getAll: async () => {
    console.log("[v0] Calling /profiles endpoint");
    const response = await apiClient.get("/profiles");
    console.log("[v0] /profiles response:", response.data);
    return response.data;
  },

  getById: async (id: string) => {
    console.log("[v0] Calling /profiles/:id endpoint with id:", id);
    const response = await apiClient.get(`/profiles/${id}`);
    console.log("[v0] /profiles/:id response:", response.data);
    return response.data;
  },

  upsert: async (data: ProfileData) => {
    console.log("[v0] Calling /profiles POST endpoint with data:", data);
    const response = await apiClient.post("/profiles", data);
    console.log("[v0] /profiles POST response:", response.data);
    return response.data;
  },
};
