import apiClient from "./apiClient";

export const authService = {
  login: async (credentials) => {
    const response = await apiClient.post("/auth/login", credentials);
    if (response.token) {
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
    }
    return response;
  },

  register: async (userData) => {
    const response = await apiClient.post("/auth/register", userData);
    if (response.token) {
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
    }
    return response;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return Promise.resolve({ success: true });
  },

  getCurrentUser: async () => {
    try {
      return await apiClient.get("/auth/me");
    } catch (error) {
      return null;
    }
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },
};

export default authService;
