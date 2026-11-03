/**
 * Admin Service Workflow, Dynamic Application Forms & Task Assignment Service
 * Base URL: https://finsocap.cloud/api
 */

import { apiClient } from "./apiClient";
import {
  ApiResponse,
  ApplicationFormVersion,
  CreateApplicationFormPayload,
  ServiceRequestItem,
  PaginatedServiceRequests,
  AssignServiceRequestPayload,
  UpdateServiceRequestStatusPayload,
} from "@/types/api";

export const adminWorkflowService = {
  // ==========================================================================
  // Form Schema & Versions Management (POST/GET/PUT /admin/services/{id}/application-forms)
  // ==========================================================================

  /**
   * POST /api/admin/services/{serviceId}/application-forms
   * Creates an unpublished draft form version (201) containing schema, ui, and documents slots.
   */
  createApplicationFormVersion: async (
    serviceId: number | string,
    payload: CreateApplicationFormPayload
  ): Promise<ApiResponse<ApplicationFormVersion>> => {
    return apiClient.post<ApiResponse<ApplicationFormVersion>>(
      `/services/${serviceId}/application-forms`,
      payload
    );
  },

  /**
   * GET /api/admin/services/{serviceId}/application-forms
   * Lists all form versions for a service.
   */
  getApplicationFormVersions: async (
    serviceId: number | string
  ): Promise<ApiResponse<ApplicationFormVersion[]>> => {
    return apiClient.get<ApiResponse<ApplicationFormVersion[]>>(
      `/services/${serviceId}/application-forms`
    );
  },

  /**
   * PUT /api/admin/services/{serviceId}/application-forms/{formVersionId}
   * Edits an unpublished form version.
   */
  updateApplicationFormVersion: async (
    serviceId: number | string,
    formVersionId: number | string,
    payload: CreateApplicationFormPayload
  ): Promise<ApiResponse<ApplicationFormVersion>> => {
    return apiClient.put<ApiResponse<ApplicationFormVersion>>(
      `/services/${serviceId}/application-forms/${formVersionId}`,
      payload
    );
  },

  /**
   * POST /api/admin/services/{serviceId}/application-forms/{formVersionId}/publish
   * Publishes a version, making it the active version for future requests.
   */
  publishApplicationFormVersion: async (
    serviceId: number | string,
    formVersionId: number | string
  ): Promise<ApiResponse<ApplicationFormVersion>> => {
    return apiClient.post<ApiResponse<ApplicationFormVersion>>(
      `/services/${serviceId}/application-forms/${formVersionId}/publish`
    );
  },

  // ==========================================================================
  // Admin Service Requests Management (/admin/service-requests)
  // ==========================================================================

  /**
   * GET /api/admin/service-requests
   * Lists all customer requests across partners with pagination and filters.
   */
  getServiceRequests: async (params?: {
    status?: string;
    assignmentStatus?: "ASSIGNED" | "UNASSIGNED" | string;
    serviceId?: number;
    partnerId?: number;
    customerId?: number;
    specialistId?: number;
    page?: number;
    size?: number;
  }): Promise<ApiResponse<PaginatedServiceRequests>> => {
    return apiClient.get<ApiResponse<PaginatedServiceRequests>>("/service-requests", params);
  },

  /**
   * GET /api/admin/service-requests/{id}
   * Retrieves full application details, snapshot, document attachments, and history.
   */
  getServiceRequestById: async (id: number | string): Promise<ApiResponse<ServiceRequestItem>> => {
    return apiClient.get<ApiResponse<ServiceRequestItem>>(`/service-requests/${id}`);
  },

  /**
   * PUT /api/admin/service-requests/{id}/assignment
   * Assigns, reassigns or unassigns staff specialist to request.
   */
  assignServiceRequest: async (
    id: number | string,
    payload: AssignServiceRequestPayload
  ): Promise<ApiResponse<ServiceRequestItem>> => {
    return apiClient.put<ApiResponse<ServiceRequestItem>>(`/service-requests/${id}/assignment`, payload);
  },

  /**
   * PATCH /api/admin/service-requests/{id}/status
   * Updates request review status, decision or cancellation.
   */
  updateServiceRequestStatus: async (
    id: number | string,
    payload: UpdateServiceRequestStatusPayload
  ): Promise<ApiResponse<ServiceRequestItem>> => {
    return apiClient.patch<ApiResponse<ServiceRequestItem>>(`/service-requests/${id}/status`, payload);
  },

  /**
   * GET /api/admin/service-requests/{id}/history
   * Retrieves complete audit history for a request.
   */
  getServiceRequestHistory: async (id: number | string): Promise<ApiResponse<any[]>> => {
    return apiClient.get<ApiResponse<any[]>>(`/service-requests/${id}/history`);
  },
};

