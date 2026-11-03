/**
 * Module 5: Team & Specialist Directory
 * REST API Specification Pages 10-11
 */

import { apiClient } from "./apiClient";
import {
  ApiResponse,
  TeamMetrics,
  Specialist,
  EnrollSpecialistPayload,
} from "@/types/api";

export const teamService = {
  /**
   * GET /api/admin/team/metrics
   * Internal personnel headcounts across Operations, Legal, and Accounting departments with utilization.
   */
  getMetrics: async (): Promise<ApiResponse<TeamMetrics>> => {
    return apiClient.get<ApiResponse<TeamMetrics>>("/team/metrics");
  },

  /**
   * GET /api/admin/team/specialists
   * Directory of internal specialists, Chartered Accountants, lawyers, active caseload, and skill sets.
   */
  getSpecialists: async (): Promise<ApiResponse<Specialist[]>> => {
    return apiClient.get<ApiResponse<Specialist[]>>("/team/specialists");
  },

  /**
   * GET /api/admin/departments
   * List of departments for staff assignment
   */
  getDepartments: async (): Promise<ApiResponse<Array<{ id: number; name: string }>>> => {
    return apiClient.get<ApiResponse<Array<{ id: number; name: string }>>>("/departments");
  },

  /**
   * POST /api/admin/departments
   * Create a new department
   */
  createDepartment: async (name: string): Promise<ApiResponse<{ id: number; name: string }>> => {
    return apiClient.post<ApiResponse<{ id: number; name: string }>>("/departments", { name });
  },

  /**
   * POST /api/admin/team/specialists
   * Enrolls a new internal specialist staff member with assigned capacity.
   */
  enrollSpecialist: async (payload: EnrollSpecialistPayload): Promise<ApiResponse<Specialist>> => {
    return apiClient.post<ApiResponse<Specialist>>("/team/specialists", payload);
  },

  /**
   * PUT /api/admin/team/specialists/{id}
   * Updates specialist capacity limits, department, and domain competencies.
   */
  updateSpecialist: async (
    id: number | string,
    payload: { maxCapacity?: number; designation?: string; department?: string; competencies?: string[] }
  ): Promise<ApiResponse<Specialist>> => {
    return apiClient.put<ApiResponse<Specialist>>(`/team/specialists/${id}`, payload);
  },
};

