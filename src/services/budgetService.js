import apiClient from "./apiClient";

export const budgetService = {
  getBudgets: async (params = {}) => {
    return apiClient.get("/budgets", { params });
  },

  createBudget: async (budgetData) => {
    return apiClient.post("/budgets", budgetData);
  },

  updateBudget: async (id, budgetData) => {
    return apiClient.put(`/budgets/${id}`, budgetData);
  },

  deleteBudget: async (id) => {
    return apiClient.delete(`/budgets/${id}`);
  },
};

export default budgetService;
