/**
 * Module 3: Franchise Partner Network
 * REST API Specification Pages 6-8
 */

import { apiClient } from "./apiClient";
import {
  ApiResponse,
  PartnerMetrics,
  PartnerSummary,
  PartnerEnrollPayload,
  PartnerStatus,
} from "@/types/api";

export const partnerService = {
  /**
   * GET /api/admin/partners/metrics
   * Summary metrics of franchise network growth and gross commission volume.
   */
  getMetrics: async (): Promise<ApiResponse<PartnerMetrics>> => {
    return apiClient.get<ApiResponse<PartnerMetrics>>("/partners/metrics");
  },

  /**
   * GET /api/admin/partners/network
   * Searchable directory of franchise branches with tiers, active cases, and approval status.
   */
  getPartners: async (): Promise<ApiResponse<PartnerSummary[]>> => {
    return apiClient.get<ApiResponse<PartnerSummary[]>>("/partners/network");
  },

  /**
   * GET /api/admin/partners/{id}/details
   * Returns complete partner profile, hub metadata, uploaded KYC files, and list of all submitted tasks.
   */
  getPartnerDetails: async (
    id: number | string
  ): Promise<ApiResponse<{ partner: PartnerSummary; casesSubmittedCount: number; activeTasks: number; tasks: any[] }>> => {
    return apiClient.get(`/partners/${id}/details`);
  },

  /**
   * POST /api/admin/partners/enroll
   * Enrolls a new franchise partner branch with Cloudinary compressed multipart KYC documents.
   */
  enrollPartner: async (
    payload: PartnerEnrollPayload,
    files?: { panDoc?: File; adhaarDoc?: File; shopDoc?: File }
  ): Promise<ApiResponse<PartnerSummary>> => {
    const formData = new FormData();
    formData.append("data", JSON.stringify(payload));

    if (files?.panDoc) formData.append("panDoc", files.panDoc);
    if (files?.adhaarDoc) formData.append("adhaarDoc", files.adhaarDoc);
    if (files?.shopDoc) formData.append("shopDoc", files.shopDoc);

    return apiClient.post<ApiResponse<PartnerSummary>>("/partners/enroll", formData);
  },

  /**
   * PUT /api/admin/partners/{id}/toggle-status
   * Approves, activates, suspends or rejects a franchise partner with audited reason notes.
   * Query params: ?status=APPROVED&reason=...
   */
  toggleStatus: async (
    id: number | string,
    status: PartnerStatus,
    reason: string
  ): Promise<ApiResponse<{ id: number; status: PartnerStatus }>> => {
    return apiClient.put<ApiResponse<{ id: number; status: PartnerStatus }>>(
      `/partners/${id}/toggle-status`,
      null,
      { status, reason }
    );
  },
};

