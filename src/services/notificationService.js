import apiClient from "./apiClient";

export const notificationService = {
  getNotifications: async () => {
    return apiClient.get("/notifications");
  },

  createNotification: async (notificationData) => {
    return apiClient.post("/notifications", notificationData);
  },

  markAsRead: async (notificationId) => {
    return apiClient.put(`/notifications/${notificationId}/read`);
  },

  deleteNotification: async (notificationId) => {
    return apiClient.delete(`/notifications/${notificationId}`);
  },
};

export default notificationService;
