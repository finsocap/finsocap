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
   * GET /api/admin/services/{serviceId}/application-form
   * Retrieves the currently published application form for a service.
   * Fallback to /application-forms if singular is not yet deployed on server.
   */
  getCurrentApplicationForm: async (
    serviceId: number | string
  ): Promise<ApiResponse<ApplicationFormVersion>> => {
    try {
      const res = await apiClient.get<ApiResponse<ApplicationFormVersion>>(
        `/services/${serviceId}/application-form`
      );
      if (res?.success && res.data) return res;
    } catch {
      // Fallback: fetch published version from application-forms array
    }

    const versionsRes = await apiClient.get<ApiResponse<ApplicationFormVersion[]>>(
      `/services/${serviceId}/application-forms`
    );
    const versions = Array.isArray(versionsRes?.data) ? versionsRes.data : [];
    const published = versions.find((v) => v.published) || versions[0] || null;

    return {
      success: !!published,
      message: published ? "Application form retrieved" : "No form version found",
      data: published as ApplicationFormVersion,
    };
  },

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

  // ==========================================================================
  // Admin Service Request Drafts & Document Uploads (Guide Sections 2-7)
  // Endpoints: /admin/partners/{partnerId}/customers/{customerId}/...
  // ==========================================================================

  /**
   * POST /api/admin/partners/{partnerId}/customers/{customerId}/services/{serviceId}/documents
   * Uploads multipart document file for a customer request.
   */
  uploadDocument: async (
    partnerId: number | string,
    customerId: number | string,
    serviceId: number | string,
    formData: FormData
  ): Promise<ApiResponse<any>> => {
    return apiClient.post<ApiResponse<any>>(
      `/partners/${partnerId}/customers/${customerId}/services/${serviceId}/documents`,
      formData
    );
  },

  /**
   * POST /api/admin/partners/{partnerId}/customers/{customerId}/service-request-drafts
   * Creates a new application draft for a customer under a partner.
   */
  createDraft: async (
    partnerId: number | string,
    customerId: number | string,
    payload: {
      serviceId: number;
      formVersionId: number;
      answers: Record<string, any>;
      documents?: Array<{ fieldKey: string; uploadId: number }>;
      instructions?: string;
    }
  ): Promise<ApiResponse<any>> => {
    return apiClient.post<ApiResponse<any>>(
      `/partners/${partnerId}/customers/${customerId}/service-request-drafts`,
      payload
    );
  },

  /**
   * GET /api/admin/partners/{partnerId}/customers/{customerId}/service-request-drafts
   * Lists all drafts for a customer.
   */
  getDrafts: async (
    partnerId: number | string,
    customerId: number | string
  ): Promise<ApiResponse<any[]>> => {
    return apiClient.get<ApiResponse<any[]>>(
      `/partners/${partnerId}/customers/${customerId}/service-request-drafts`
    );
  },

  /**
   * GET /api/admin/partners/{partnerId}/customers/{customerId}/service-request-drafts/{draftId}
   * Fetches single full draft details.
   */
  getDraftById: async (
    partnerId: number | string,
    customerId: number | string,
    draftId: number | string
  ): Promise<ApiResponse<any>> => {
    return apiClient.get<ApiResponse<any>>(
      `/partners/${partnerId}/customers/${customerId}/service-request-drafts/${draftId}`
    );
  },

  /**
   * PUT /api/admin/partners/{partnerId}/customers/{customerId}/service-request-drafts/{draftId}
   * Updates an existing draft.
   */
  updateDraft: async (
    partnerId: number | string,
    customerId: number | string,
    draftId: number | string,
    payload: {
      serviceId: number;
      formVersionId: number;
      answers: Record<string, any>;
      documents?: Array<{ fieldKey: string; uploadId: number }>;
      instructions?: string;
      expectedVersion: number;
    }
  ): Promise<ApiResponse<any>> => {
    return apiClient.put<ApiResponse<any>>(
      `/partners/${partnerId}/customers/${customerId}/service-request-drafts/${draftId}`,
      payload
    );
  },

  /**
   * POST /api/admin/partners/{partnerId}/customers/{customerId}/service-request-drafts/{draftId}/submit
   * Submits draft and converts it into a pending service request.
   */
  submitDraft: async (
    partnerId: number | string,
    customerId: number | string,
    draftId: number | string,
    expectedVersion: number
  ): Promise<ApiResponse<any>> => {
    return apiClient.post<ApiResponse<any>>(
      `/partners/${partnerId}/customers/${customerId}/service-request-drafts/${draftId}/submit`,
      { expectedVersion }
    );
  },

  /**
   * DELETE /api/admin/partners/{partnerId}/customers/{customerId}/service-request-drafts/{draftId}
   * Deletes an unsubmitted draft.
   */
  deleteDraft: async (
    partnerId: number | string,
    customerId: number | string,
    draftId: number | string
  ): Promise<ApiResponse<null>> => {
    return apiClient.delete<ApiResponse<null>>(
      `/partners/${partnerId}/customers/${customerId}/service-request-drafts/${draftId}`
    );
  },
};

