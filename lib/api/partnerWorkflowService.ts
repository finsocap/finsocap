/**
 * Partner Services, Customers, Service Requests & Document Uploads API Service
 * Base URL: https://finsocap.cloud/api
 */

import { apiClient } from "./apiClient";
import {
  ApiResponse,
  PartnerCustomer,
  CreateCustomerPayload,
  DirectServiceRequestPayload,
  DocumentUploadResponse,
  ServiceRequestDraft,
  ServiceRequestItem,
  PaginatedServiceRequests,
  ApplicationFormVersion,
} from "@/types/api";

export const partnerWorkflowService = {
  // ==========================================================================
  // Customers (POST & GET /partners/customers)
  // ==========================================================================

  /**
   * GET /api/partners/customers
   * Lists all customers belonging to the partner.
   */
  getCustomers: async (): Promise<ApiResponse<PartnerCustomer[]>> => {
    return apiClient.get<ApiResponse<PartnerCustomer[]>>("/partners/customers");
  },

  /**
   * POST /api/partners/customers
   * Creates a new customer under the partner.
   */
  createCustomer: async (payload: CreateCustomerPayload): Promise<ApiResponse<PartnerCustomer>> => {
    return apiClient.post<ApiResponse<PartnerCustomer>>("/partners/customers", payload);
  },

  // ==========================================================================
  // Partner Catalog & Application Forms (GET /partners/services)
  // ==========================================================================

  /**
   * GET /api/partners/services
   * Lists all active services available for partners to request.
   */
  getAvailableServices: async (): Promise<ApiResponse<any[]>> => {
    return apiClient.get<ApiResponse<any[]>>("/partners/services");
  },

  /**
   * GET /api/partners/services/{id}/application-form
   * Retrieves active schema, UI instructions, version and required document slots for a service.
   */
  getServiceApplicationForm: async (serviceId: number | string): Promise<ApiResponse<ApplicationFormVersion>> => {
    return apiClient.get<ApiResponse<ApplicationFormVersion>>(`/partners/services/${serviceId}/application-form`);
  },

  // ==========================================================================
  // Document Uploads (POST /partners/customers/{customerId}/services/{serviceId}/documents)
  // ==========================================================================

  /**
   * POST /api/partners/customers/{customerId}/services/{serviceId}/documents
   * Uploads customer document (PDF, PNG, JPEG, max 10MB) into the document slot, returns uploadId.
   */
  uploadCustomerDocument: async (
    customerId: number | string,
    serviceId: number | string,
    fieldKey: string,
    file: File,
    formVersionId?: number | string
  ): Promise<ApiResponse<DocumentUploadResponse>> => {
    const formData = new FormData();
    formData.append("fieldKey", fieldKey);
    if (formVersionId) {
      formData.append("formVersionId", String(formVersionId));
    }
    formData.append("file", file);

    return apiClient.post<ApiResponse<DocumentUploadResponse>>(
      `/partners/customers/${customerId}/services/${serviceId}/documents`,
      formData
    );
  },

  /**
   * DELETE /api/partners/uploads/{uploadId}
   * Removes unattached uploaded document before final submission.
   */
  deleteUnattachedUpload: async (uploadId: number | string): Promise<ApiResponse<null>> => {
    return apiClient.delete<ApiResponse<null>>(`/partners/uploads/${uploadId}`);
  },

  // ==========================================================================
  // Service Requests (POST & GET /partners/customers/{id}/service-requests)
  // ==========================================================================

  /**
   * POST /api/partners/customers/{customerId}/service-requests
   * Submits a service request for a customer, creating a PENDING task in the admin task system.
   */
  createServiceRequest: async (
    customerId: number | string,
    payload: DirectServiceRequestPayload
  ): Promise<ApiResponse<ServiceRequestItem>> => {
    return apiClient.post<ApiResponse<ServiceRequestItem>>(
      `/partners/customers/${customerId}/service-requests`,
      payload
    );
  },

  /**
   * GET /api/partners/customers/{customerId}/service-requests
   * Lists all service requests for a specific customer.
   */
  getCustomerServiceRequests: async (customerId: number | string): Promise<ApiResponse<ServiceRequestItem[]>> => {
    return apiClient.get<ApiResponse<ServiceRequestItem[]>>(
      `/partners/customers/${customerId}/service-requests`
    );
  },

  /**
   * GET /api/partners/service-requests
   * Lists all service requests submitted by the partner.
   */
  getPartnerServiceRequests: async (params?: Record<string, any>): Promise<ApiResponse<PaginatedServiceRequests>> => {
    return apiClient.get<ApiResponse<PaginatedServiceRequests>>("/partners/service-requests", params);
  },

  /**
   * GET /api/partners/service-requests/{id}
   * Retrieves full details, snapshot, documents and history of a request.
   */
  getServiceRequestDetails: async (id: number | string): Promise<ApiResponse<ServiceRequestItem>> => {
    return apiClient.get<ApiResponse<ServiceRequestItem>>(`/partners/service-requests/${id}`);
  },

  /**
   * PUT /api/partners/service-requests/{id}/application
   * Corrects answers and documents when request status is PENDING_FROM_CLIENT.
   */
  correctServiceRequestApplication: async (
    id: number | string,
    payload: DirectServiceRequestPayload & { expectedVersion: number }
  ): Promise<ApiResponse<ServiceRequestItem>> => {
    return apiClient.put<ApiResponse<ServiceRequestItem>>(
      `/partners/service-requests/${id}/application`,
      payload
    );
  },

  // ==========================================================================
  // Drafts (POST/GET/PUT/DELETE /partners/customers/{id}/service-request-drafts)
  // ==========================================================================

  /**
   * POST /api/partners/customers/{customerId}/service-request-drafts
   */
  saveDraft: async (
    customerId: number | string,
    payload: DirectServiceRequestPayload
  ): Promise<ApiResponse<ServiceRequestDraft>> => {
    return apiClient.post<ApiResponse<ServiceRequestDraft>>(
      `/partners/customers/${customerId}/service-request-drafts`,
      payload
    );
  },

  /**
   * GET /api/partners/customers/{customerId}/service-request-drafts
   */
  getCustomerDrafts: async (customerId: number | string): Promise<ApiResponse<ServiceRequestDraft[]>> => {
    return apiClient.get<ApiResponse<ServiceRequestDraft[]>>(
      `/partners/customers/${customerId}/service-request-drafts`
    );
  },

  /**
   * GET /api/partners/customers/{customerId}/service-request-drafts/{draftId}
   */
  getDraftDetails: async (
    customerId: number | string,
    draftId: number | string
  ): Promise<ApiResponse<ServiceRequestDraft>> => {
    return apiClient.get<ApiResponse<ServiceRequestDraft>>(
      `/partners/customers/${customerId}/service-request-drafts/${draftId}`
    );
  },

  /**
   * PUT /api/partners/customers/{customerId}/service-request-drafts/{draftId}
   */
  updateDraft: async (
    customerId: number | string,
    draftId: number | string,
    payload: DirectServiceRequestPayload & { expectedVersion: number }
  ): Promise<ApiResponse<ServiceRequestDraft>> => {
    return apiClient.put<ApiResponse<ServiceRequestDraft>>(
      `/partners/customers/${customerId}/service-request-drafts/${draftId}`,
      payload
    );
  },

  /**
   * DELETE /api/partners/customers/{customerId}/service-request-drafts/{draftId}
   */
  deleteDraft: async (customerId: number | string, draftId: number | string): Promise<ApiResponse<null>> => {
    return apiClient.delete<ApiResponse<null>>(
      `/partners/customers/${customerId}/service-request-drafts/${draftId}`
    );
  },

  /**
   * POST /api/partners/customers/{customerId}/service-request-drafts/{draftId}/submit
   */
  submitDraft: async (
    customerId: number | string,
    draftId: number | string,
    expectedVersion: number
  ): Promise<ApiResponse<ServiceRequestItem>> => {
    return apiClient.post<ApiResponse<ServiceRequestItem>>(
      `/partners/customers/${customerId}/service-request-drafts/${draftId}/submit`,
      { expectedVersion }
    );
  },
};

