import apiClient from "./apiClient";
import { achievementService } from "./achievementService";

export const expenseService = {
  getExpenses: async (params = {}) => {
    return apiClient.get("/expenses", { params });
  },

  getExpense: async (id) => {
    return apiClient.get(`/expenses/${id}`);
  },

  createExpense: async (expenseData) => {
    const response = await apiClient.post("/expenses/add", expenseData);

    // Refresh achievements after adding a new expense
    try {
      await achievementService.refreshAfterNewRecord();
    } catch (error) {
      console.error("Error refreshing achievements:", error);
    }

    return response;
  },

  updateExpense: async (id, expenseData) => {
    return apiClient.put(`/expenses/edit/${id}`, expenseData);
  },

  deleteExpense: async (id) => {
    return apiClient.delete(`/expenses/delete/${id}`);
  },

  getCategories: async () => {
    return apiClient.get("/categories");
  },

  exportPDF: async () => {
    return apiClient.get("/expenses/export-pdf", {
      responseType: "blob",
    });
  },

  exportExcel: async (startDate, endDate) => {
    return apiClient.get("/export/expenses/excel", {
      params: { startDate, endDate },
      responseType: "blob",
    });
  },

  sendReport: async (emailData) => {
    return apiClient.post("/expenses/send-report", emailData);
  },
};

export default expenseService;
