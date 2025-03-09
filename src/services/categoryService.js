import apiClient from "./apiClient";

export const categoryService = {
  getCategories: async () => {
    return apiClient.get("/categories");
  },

  createCategory: async (categoryData) => {
    return apiClient.post("/categories", categoryData);
  },

  updateCategory: async (id, categoryData) => {
    return apiClient.put(`/categories/${id}`, categoryData);
  },

  deleteCategory: async (id) => {
    return apiClient.delete(`/categories/${id}`);
  },
};

export default categoryService;
