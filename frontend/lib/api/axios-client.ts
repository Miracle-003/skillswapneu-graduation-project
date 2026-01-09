import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

console.log("[v0] API Client initialized with URL:", API_URL);

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  if (token) {
    console.log("[v0] Adding auth token to request:", config.url);
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.log("[v0] No auth token found for request:", config.url);
  }
  return config;
});

// Handle auth errors
apiClient.interceptors.response.use(
  (response) => {
    console.log(
      "[v0] API Response success:",
      response.config.url,
      response.status,
    );
    return response;
  },
  (error) => {
    console.error(
      "[v0] API Response error:",
      error.config?.url,
      error.response?.status,
      error.response?.data,
    );
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);
