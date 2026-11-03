/**
 * Module 2: Tasks Operations & Kanban Board
 * REST API Specification Pages 4-6
 */

import { apiClient } from "./apiClient";
import {
  ApiResponse,
  TaskMetrics,
  BackendTask,
  TaskQueryParams,
  UpdateTaskPayload,
  RaiseQueryPayload,
} from "@/types/api";

export const taskApiService = {
  /**
   * GET /api/admin/tasks/metrics
   * Top KPI counter metrics cards for task operational status overview.
   */
  getMetrics: async (): Promise<ApiResponse<TaskMetrics>> => {
    return apiClient.get<ApiResponse<TaskMetrics>>("/tasks/metrics");
  },

  /**
   * GET /api/admin/tasks
   * Full searchable task directory with date range, category, status, and keyword search filters.
   */
  getTasks: async (params?: TaskQueryParams): Promise<ApiResponse<BackendTask[]>> => {
    return apiClient.get<ApiResponse<BackendTask[]>>("/tasks", params as any);
  },

  /**
   * GET /api/admin/tasks/{id}
   * Retrieves detailed task records, attached applicant details, and internal remarks.
   */
  getTaskById: async (id: number | string): Promise<ApiResponse<BackendTask>> => {
    return apiClient.get<ApiResponse<BackendTask>>(`/tasks/${id}`);
  },

  /**
   * PUT /api/admin/tasks/{id}
   * Updates task status, reassigns specialist, or extends SLA due dates.
   */
  updateTask: async (id: number | string, payload: UpdateTaskPayload): Promise<ApiResponse<BackendTask>> => {
    return apiClient.put<ApiResponse<BackendTask>>(`/tasks/${id}`, payload);
  },

  /**
   * POST /api/admin/tasks/{id}/raise-query
   * Raises formal administrative query back to franchise partner.
   * Transitions status to PENDING_FROM_CLIENT.
   */
  raiseQuery: async (id: number | string, payload: RaiseQueryPayload): Promise<ApiResponse<any>> => {
    return apiClient.post<ApiResponse<any>>(`/tasks/${id}/raise-query`, payload);
  },
};

