/**
 * Module 1: Task Delegation & Workload Distribution
 * REST API Specification Pages 2-4
 */

import { apiClient } from "./apiClient";
import {
  ApiResponse,
  WorkloadMetrics,
  BalancingRecommendation,
  AssignTaskRequest,
  DelegationListItem,
} from "@/types/api";

export const workloadService = {
  /**
   * GET /api/admin/tasks/workload
   * Fetches team capacity overview, active tasks, specialist utilization percentage, and unassigned queue counts.
   */
  getWorkload: async (): Promise<ApiResponse<WorkloadMetrics>> => {
    return apiClient.get<ApiResponse<WorkloadMetrics>>("/tasks/workload");
  },

  /**
   * GET /api/admin/tasks/balancing-recommendations
   * Smart balancing engine calculations suggesting task re-allocations to avoid bottlenecks.
   */
  getBalancingRecommendations: async (): Promise<ApiResponse<BalancingRecommendation[]>> => {
    return apiClient.get<ApiResponse<BalancingRecommendation[]>>("/tasks/balancing-recommendations");
  },

  /**
   * POST /api/admin/tasks/balancing-recommendations/{id}/apply
   * One-click execution of smart balancing recommendation, auto-assigning cases to suggested specialist.
   */
  applyRecommendation: async (recommendationId: string): Promise<ApiResponse<null>> => {
    return apiClient.post<ApiResponse<null>>(`/tasks/balancing-recommendations/${recommendationId}/apply`);
  },

  /**
   * POST /api/admin/tasks/assign
   * Assigns or re-delegates a client case task to a selected specialist with delegation instructions.
   */
  assignTask: async (payload: AssignTaskRequest): Promise<ApiResponse<any>> => {
    return apiClient.post<ApiResponse<any>>("/tasks/assign", payload);
  },

  /**
   * GET /api/admin/tasks/delegation-list
   * Returns filtered queue for task delegation workflow.
   * Query: ?type=RECENTLY_ASSIGNED or UNASSIGNED
   */
  getDelegationList: async (type?: "RECENTLY_ASSIGNED" | "UNASSIGNED"): Promise<ApiResponse<DelegationListItem[]>> => {
    return apiClient.get<ApiResponse<DelegationListItem[]>>("/tasks/delegation-list", type ? { type } : undefined);
  },
};

