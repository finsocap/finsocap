/**
 * Staff Tasks & Workflow Status Service
 * Base URL: https://finsocap.cloud/api
 */

import { apiClient } from "./apiClient";
import {
  ApiResponse,
  ServiceRequestItem,
  PaginatedServiceRequests,
  UpdateServiceRequestStatusPayload,
} from "@/types/api";

export const staffWorkflowService = {
  /**
   * POST /api/staff/login
   * Authenticates staff specialist / employee.
   */
  login: async (credentials: { email: string; password: string }): Promise<ApiResponse<any>> => {
    return apiClient.post<ApiResponse<any>>("/staff/login", credentials);
  },

  /**
   * GET /api/staff/tasks
   * Lists paginated tasks assigned to the currently authenticated specialist.
   */
  getAssignedTasks: async (params?: {
    status?: string;
    serviceId?: number;
    page?: number;
    size?: number;
  }): Promise<ApiResponse<PaginatedServiceRequests>> => {
    return apiClient.get<ApiResponse<PaginatedServiceRequests>>("/staff/tasks", params);
  },

  /**
   * GET /api/staff/tasks/{id}
   * Retrieves assigned task application details, answers, document attachments, and history.
   */
  getTaskDetails: async (id: number | string): Promise<ApiResponse<ServiceRequestItem>> => {
    return apiClient.get<ApiResponse<ServiceRequestItem>>(`/staff/tasks/${id}`);
  },

  /**
   * PATCH /api/staff/tasks/{id}/status
   * Transitions work status (e.g. IN_PROGRESS -> PENDING_FROM_CLIENT / SENT_FOR_REVIEW).
   */
  updateTaskStatus: async (
    id: number | string,
    payload: UpdateServiceRequestStatusPayload
  ): Promise<ApiResponse<ServiceRequestItem>> => {
    return apiClient.patch<ApiResponse<ServiceRequestItem>>(`/staff/tasks/${id}/status`, payload);
  },
};

