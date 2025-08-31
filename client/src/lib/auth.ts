import { apiRequest } from "./queryClient";

export const login = async (email: string, password: string) => {
  const response = await apiRequest("POST", "/api/auth/login", { email, password });
  return response.json();
};

export const register = async (userData: {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
}) => {
  const response = await apiRequest("POST", "/api/auth/register", userData);
  return response.json();
};

export const getMe = async () => {
  const response = await fetch("/api/auth/me", {
    credentials: "include",
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      // Try to refresh token automatically
      try {
        await refreshToken();
        // Retry the request after refresh
        const retryResponse = await fetch("/api/auth/me", {
          credentials: "include",
        });
        if (!retryResponse.ok) {
          throw new Error("Authentication failed");
        }
        return retryResponse.json();
      } catch {
        throw new Error("Authentication failed");
      }
    }
    throw new Error("Failed to get user data");
  }
  
  return response.json();
};

export const logout = async () => {
  const response = await apiRequest("POST", "/api/auth/logout");
  return response.json();
};

export const refreshToken = async () => {
  const response = await apiRequest("POST", "/api/auth/refresh");
  return response.json();
};
