import apiClient from "./apiClient";

export const statsService = { 
  getOverview: async (params = {}) => {
    return apiClient.get("/statistics/overview", { params });
  },

  getMonthlyStats: async (params = {}) => {
    return apiClient.get("/statistics/monthly", { params });
  },

  getCategoryBreakdown: async (params = {}) => {
    return apiClient.get("/statistics/category-breakdown", { params });
  },
};

export default statsService;
