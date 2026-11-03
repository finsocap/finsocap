/**
 * Module 6: Products & Services Catalog
 * REST API Specification Pages 12-14
 */

import { apiClient } from "./apiClient";
import {
  ApiResponse,
  CatalogService,
  CreateServicePayload,
} from "@/types/api";

export const serviceCatalogService = {
  /**
   * GET /api/admin/services
   * Services rate card with retail starting price, partner commission share, SLA days, and checklists.
   */
  getServices: async (): Promise<ApiResponse<CatalogService[]>> => {
    return apiClient.get<ApiResponse<CatalogService[]>>("/services");
  },

  /**
   * GET /api/admin/services/{id}
   * Single service breakdown with workflow milestones and uploaded SOP documents.
   */
  getServiceById: async (id: number | string): Promise<ApiResponse<CatalogService>> => {
    return apiClient.get<ApiResponse<CatalogService>>(`/services/${id}`);
  },

  /**
   * POST /api/admin/services
   * Creates a new service in the catalog with pricing, commission, and required docs checklist.
   */
  createService: async (payload: CreateServicePayload): Promise<ApiResponse<CatalogService>> => {
    return apiClient.post<ApiResponse<CatalogService>>("/services", payload);
  },

  /**
   * PUT /api/admin/services/{id}
   * Updates existing service pricing, commission, or workflow milestones.
   */
  updateService: async (
    id: number | string,
    payload: Partial<CatalogService>
  ): Promise<ApiResponse<CatalogService>> => {
    return apiClient.put<ApiResponse<CatalogService>>(`/services/${id}`, payload);
  },

  /**
   * PATCH /api/admin/services/{id}/toggle-active
   * Instantly toggles service active/inactive status in franchise rate card.
   */
  toggleActive: async (id: number | string): Promise<ApiResponse<{ id: number; active: boolean }>> => {
    return apiClient.patch<ApiResponse<{ id: number; active: boolean }>>(`/services/${id}/toggle-active`);
  },

  /**
   * DELETE /api/admin/services/{id}
   * Deletes an obsolete service from the catalog.
   */
  deleteService: async (id: number | string): Promise<ApiResponse<null>> => {
    return apiClient.delete<ApiResponse<null>>(`/services/${id}`);
  },

  /**
   * POST /api/admin/services/{id}/sops
   * Uploads service Standard Operating Procedure (SOP) guideline document to Cloudinary.
   */
  uploadSop: async (
    id: number | string,
    file: File,
    title: string
  ): Promise<ApiResponse<{ sopUrl: string; title: string }>> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    return apiClient.post<ApiResponse<{ sopUrl: string; title: string }>>(`/services/${id}/sops`, formData);
  },
};

