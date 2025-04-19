import apiClient from "./apiClient";
import { achievementService } from "./achievementService";

export const incomeService = {
  getIncomes: async (params = {}) => {
    return apiClient.get("/incomes", { params });
  },

  getIncome: async (id) => {
    return apiClient.get(`/incomes/${id}`);
  },

  createIncome: async (incomeData) => {
    const response = await apiClient.post("/incomes", incomeData);

    // Refresh achievements after adding a new income
    try {
      await achievementService.refreshAfterNewRecord();
    } catch (error) {
      console.error("Error refreshing achievements:", error);
    }

    return response;
  },

  updateIncome: async (id, incomeData) => {
    return apiClient.put(`/incomes/${id}`, incomeData);
  },

  deleteIncome: async (id) => {
    return apiClient.delete(`/incomes/${id}`);
  },

  getCategories: async () => {
    return apiClient.get("/incomes/categories");
  },

  exportPDF: async () => {
    return apiClient.get("/incomes/export-pdf", {
      responseType: "blob",
    });
  },

  exportExcel: async (startDate, endDate) => {
    return apiClient.get("/export/incomes/excel", {
      params: { startDate, endDate },
      responseType: "blob",
    });
  },

  sendReport: async (emailData) => {
    return apiClient.post("/incomes/send-report", emailData);
  },
};

export default incomeService;
