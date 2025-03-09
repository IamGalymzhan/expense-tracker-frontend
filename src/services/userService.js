import apiClient from "./apiClient";

export const userService = {
  getProfile: async () => {
    return apiClient.get("/user/profile");
  },

  updateProfile: async (profileData) => {
    return apiClient.put("/user/profile", profileData);
  },

  updatePassword: async (passwordData) => {
    return apiClient.put("/user/password", passwordData);
  },
};

export default userService;
