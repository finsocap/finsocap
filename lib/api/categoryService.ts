/**
 * Module: Categories Management
 * REST API Endpoints:
 * - GET    /api/admin/categories
 * - POST   /api/admin/categories
 * - PUT    /api/admin/categories/{id}
 * - DELETE /api/admin/categories/{id}
 */

import { apiClient } from "./apiClient";
import { ApiResponse } from "@/types/api";

export interface ServiceCategoryItem {
  id: number;
  name: string;
}

export const categoryService = {
  /**
   * GET /api/admin/categories
   * List all categories
   */
  getCategories: async (): Promise<ApiResponse<ServiceCategoryItem[]>> => {
    return apiClient.get<ApiResponse<ServiceCategoryItem[]>>("/categories");
  },

  /**
   * POST /api/admin/categories
   * Create a new category
   */
  createCategory: async (name: string): Promise<ApiResponse<ServiceCategoryItem>> => {
    return apiClient.post<ApiResponse<ServiceCategoryItem>>("/categories", { name });
  },

  /**
   * PUT /api/admin/categories/{id}
   * Edit an existing category
   */
  updateCategory: async (id: number, name: string): Promise<ApiResponse<ServiceCategoryItem>> => {
    return apiClient.put<ApiResponse<ServiceCategoryItem>>(`/categories/${id}`, { name });
  },

  /**
   * DELETE /api/admin/categories/{id}
   * Delete category (cannot be deleted if assigned to services)
   */
  deleteCategory: async (id: number): Promise<ApiResponse<null>> => {
    return apiClient.delete<ApiResponse<null>>(`/categories/${id}`);
  },
};

