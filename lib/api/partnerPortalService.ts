/**
 * Comprehensive FinSoCap 30 Partner Operations Service Layer
 * Single Source of Truth: FINSOCAP - ALL PARTNER APIs (8 November 2026)
 */

import { apiClient, ApiError } from "./apiClient";
import { ApiResponse } from "@/types/api";

// ============================================================================
// Types Definition for the 30 Partner Operations
// ============================================================================

export interface PartnerRegistrationJsonPayload {
  name: string;
  phone: string;
  email: string;
  dob?: string;
  shopName?: string;
  currentAddress?: string;
  completeShopAddress?: string;
  city?: string;
  state?: string;
  panNumber?: string;
  adhaarNumber?: string;
  password?: string;
  documents?: Array<{ type: string; fileName: string; fileUrl: string }>;
}

export interface PartnerRegistrationResponseData {
  id: number;
  userId: number;
  name: string;
  phone: string;
  email: string;
  dob?: string;
  shopName?: string;
  currentAddress?: string;
  completeShopAddress?: string;
  city?: string;
  state?: string;
  panNumber?: string;
  adhaarNumber?: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "ACTIVE" | "DEACTIVATED";
  rejectionReason?: string | null;
  documents?: any[];
  createdAt: string;
  reviewedAt?: string | null;
}

export interface PartnerLoginPayload {
  email: string;
  password: string;
}

export interface PartnerLoginResponseData {
  token: string;
  tokenType: "Bearer" | string;
  id: number;
  email: string;
  role: "PARTNER";
  name: string;
  status: "APPROVED" | "PENDING" | "REJECTED" | string;
}

export interface PartnerProfileData {
  id: number;
  userId: number;
  name: string;
  phone: string;
  email: string;
  dob?: string;
  shopName?: string;
  currentAddress?: string;
  completeShopAddress?: string;
  address?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  panNumber?: string;
  adhaarNumber?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  branchName?: string;
  status: string;
  rejectionReason?: string | null;
  documents?: any[];
  adhaarDocUrl?: string;
  panDocUrl?: string;
  createdAt: string;
  reviewedAt?: string | null;
}

export interface PartnerCustomerPayload {
  name: string;
  phone: string;
  email?: string;
  businessName?: string;
  constitutionType?: "PRIVATE_LTD_OPC" | "LLP_PARTNERSHIP" | "SOLE_PROPRIETORSHIP" | string;
}

export interface PartnerCustomerItem {
  id: number;
  name: string;
  phone: string;
  email?: string;
  businessName?: string;
  constitutionType?: string;
  partnerName: string;
  partnerCode: string;
  serviceCases: number;
  latestStatus: string;
}

export interface PartnerCatalogService {
  id: number;
  name: string;
  categoryId: number;
  category: string;
  subtitle?: string;
  startingClientPrice: number;
  partnerProfit: number;
  requiredDocuments: string[];
  studyMaterials?: any[];
  studyMaterialFiles?: any[];
  sops?: any[];
  yearWiseFeesEnabled?: boolean;
  yearWiseFees?: any[];
  active: boolean;
  processingTime?: string;
  overviewHtml?: string;
  eligibilityCriteria?: string;
  keyFeatures?: string[];
  workflowSteps?: string[];
  officialGovernmentPortalLinks?: string[];
  trainingVideoTutorials?: string[];
  faqs?: any[];
  contentDetails?: string;
  baseGovernmentFee?: number;
}

export interface ApplicationDocumentRequirement {
  fieldKey: string;
  label: string;
  required: boolean;
  mimeTypes: string[];
  maxBytes: number;
  maxFiles: number;
  requiredWhen?: string | null;
}

export interface ApplicationFormVersionData {
  formVersionId: number | null;
  serviceId: number;
  revision?: number;
  published: boolean;
  schema: {
    type: string;
    properties?: Record<string, any>;
    required?: string[];
    additionalProperties?: boolean;
  };
  ui?: Record<string, any>;
  documents: ApplicationDocumentRequirement[];
  service: PartnerCatalogService;
}

export interface ApplicationDocumentUploadResponse {
  uploadId: number;
  fieldKey: string;
  customerId: number;
  serviceId: number;
  formVersionId: number;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  downloadUrl: string;
}

export interface DirectSubmitApplicationPayload {
  serviceId: number;
  formVersionId?: number | null;
  answers: Record<string, any>;
  documents: Array<{
    fieldKey: string;
    uploadId: number;
  }>;
  instructions?: string;
}

export interface ServiceRequestSummary {
  id: number;
  requestCode: string;
  version: number;
  customerId: number;
  customerName?: string;
  partnerId?: number;
  partnerName?: string;
  serviceId: number;
  serviceName: string;
  status: "PENDING" | "IN_PROGRESS" | "SEE_FULL_REVIEW" | "SENT_FOR_REVIEW" | "PENDING_FROM_CLIENT" | "PENDING_FROM_DEPARTMENT" | "COMPLETED" | "CANCELLED";
  assignmentStatus: "ASSIGNED" | "UNASSIGNED";
  assignedTo?: any;
  assignedToId?: number | null;
  assignedToName?: string | null;
  priority?: string;
  dueDate?: string | null;
  createdAt: string;
  fee: number;
  amountPending: number;
  instructions?: string;
  queryMessage?: string | null;
}

export interface PaginatedServiceRequestsList {
  items: ServiceRequestSummary[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ServiceRequestDraftData {
  submissionId: number;
  submissionVersion: number;
  formVersionId: number;
  formSchema: any;
  formUi?: any;
  documentRequirements: ApplicationDocumentRequirement[];
  answers: Record<string, any>;
  documents: Array<{
    uploadId: number;
    fieldKey: string;
    customerId: number;
    serviceId: number;
    formVersionId: number;
    fileName: string;
    contentType: string;
    sizeBytes: number;
    downloadUrl: string;
  }>;
  pricingSnapshot?: any;
  submittedAt?: string | null;
  draftId: number;
  version: number; // Important: expectedVersion for draft operations
  customerId: number;
  serviceId: number;
  instructions?: string;
  status: "DRAFT";
  taskId?: number | null;
}

export interface ServiceRequestDetailData extends ServiceRequestSummary {
  submissionId: number;
  submissionVersion: number; // Important: expectedVersion for correction
  formVersionId: number;
  formSchema: any;
  formUi?: any;
  documentRequirements: ApplicationDocumentRequirement[];
  answers: Record<string, any>;
  documents: Array<{
    uploadId: number;
    fieldKey: string;
    customerId: number;
    serviceId: number;
    formVersionId: number;
    fileName: string;
    contentType: string;
    sizeBytes: number;
    downloadUrl: string;
  }>;
  pricingSnapshot?: any;
  submittedAt?: string | null;
  history?: any[];
}

export interface TaskCollaborationFileItem {
  id: number;
  taskId: number;
  title: string;
  documentType: "CERTIFICATE" | "ACKNOWLEDGEMENT" | "NOTICE" | "CHAT" | "PARTNER_RESPONSE" | "OTHER";
  fileName: string;
  contentType: string;
  sizeBytes: number;
  uploadedBy: string;
  uploadedByRole: "PARTNER" | "STAFF" | "ADMIN";
  createdAt: string;
  completionId?: number | null;
  documentRequestId?: number | null;
  itemKey?: string | null;
  replacesTaskFileId?: number | null;
  downloadPath: string;
}

export interface TaskChatMessageItem {
  id: number;
  taskId: number;
  sender: string;
  senderRole: "PARTNER" | "STAFF" | "ADMIN";
  text: string;
  createdAt: string;
  attachment?: {
    id: number;
    fileName: string;
    contentType: string;
    sizeBytes: number;
    downloadPath: string;
  } | null;
}

export interface OutstandingDocumentRequestItem {
  itemKey: string;
  label: string;
  replacesDocumentId?: number | null;
  replacesTaskFileId?: number | null;
  responseFileId?: number | null;
}

export interface OutstandingDocumentRequest {
  id: number;
  taskId: number;
  version: number; // Important: expectedVersion for document-request submit
  message: string;
  status: "OPEN" | "SUBMITTED" | "CANCELLED";
  requestedBy: string;
  requestedByRole: "STAFF" | "ADMIN";
  createdAt: string;
  items: OutstandingDocumentRequestItem[];
}

export interface TaskCompletionData extends ServiceRequestSummary {
  completion: {
    id: number;
    completedAt: string;
    completedBy: string;
    completedByRole: string;
    notes: string;
    licenceId?: number;
    licenceType?: "PERMANENT" | "RENEWAL";
    licenceNumber?: string;
    issueDate?: string;
    expiryDate?: string;
    portalUserId?: string;
    hasPortalPassword?: boolean;
  } | null;
  completionAttachments: Array<{
    id: number;
    fileName: string;
    contentType: string;
    sizeBytes: number;
    downloadUrl: string;
  }>;
}

// Convenient type aliases matching dashboard usage
export type PartnerServiceRequestListItem = ServiceRequestSummary;
export type PartnerServiceItem = PartnerCatalogService;
export type PartnerServiceRequestDetail = ServiceRequestDetailData;
export type PartnerServiceRequestHistory = { status: string; timestamp?: string; remarks?: string };
export type PartnerChatMessage = TaskChatMessageItem;
export type PartnerDocumentRequest = OutstandingDocumentRequest;
export type PartnerTaskFileItem = TaskCollaborationFileItem;
export type PartnerTaskCompletion = TaskCompletionData["completion"] & {
  certificateUrl?: string;
  certificateName?: string;
};


// ============================================================================
// Service Implementation: Grouped by Capability
// ============================================================================

export const partnerPortalService = {
  // --------------------------------------------------------------------------
  // 1. Auth Module (Ops 01, 02, 03, 04)
  // --------------------------------------------------------------------------
  auth: {
    /**
     * Op 01: POST /api/partners/register
     */
    registerJson: async (payload: PartnerRegistrationJsonPayload): Promise<ApiResponse<PartnerRegistrationResponseData>> => {
      return apiClient.post<ApiResponse<PartnerRegistrationResponseData>>("/partners/register", payload);
    },

    /**
     * Op 02: POST /api/partners/register-with-files
     * Note: "data" part MUST be a JSON Blob with type application/json.
     * Field name "adhaarDoc" is intentional spelling from backend specification.
     */
    registerWithFiles: async (
      data: PartnerRegistrationJsonPayload,
      files?: { panDoc?: File; adhaarDoc?: File; shopDoc?: File }
    ): Promise<ApiResponse<PartnerRegistrationResponseData>> => {
      const formData = new FormData();
      const jsonBlob = new Blob([JSON.stringify(data)], { type: "application/json" });
      formData.append("data", jsonBlob);

      if (files?.panDoc) formData.append("panDoc", files.panDoc);
      if (files?.adhaarDoc) formData.append("adhaarDoc", files.adhaarDoc);
      if (files?.shopDoc) formData.append("shopDoc", files.shopDoc);

      return apiClient.post<ApiResponse<PartnerRegistrationResponseData>>("/partners/register-with-files", formData);
    },

    /**
     * Op 03: POST /api/partners/login
     */
    login: async (credentials: PartnerLoginPayload): Promise<ApiResponse<PartnerLoginResponseData>> => {
      return apiClient.post<ApiResponse<PartnerLoginResponseData>>("/partners/login", credentials);
    },

    /**
     * Op 04: GET /api/partners/me
     */
    getProfile: async (): Promise<ApiResponse<PartnerProfileData>> => {
      return apiClient.get<ApiResponse<PartnerProfileData>>("/partners/me");
    },
  },

  // --------------------------------------------------------------------------
  // 2. Customers Module (Ops 05, 06)
  // --------------------------------------------------------------------------
  customers: {
    /**
     * Op 05: POST /api/partners/customers
     */
    create: async (payload: PartnerCustomerPayload): Promise<ApiResponse<PartnerCustomerItem>> => {
      return apiClient.post<ApiResponse<PartnerCustomerItem>>("/partners/customers", payload);
    },

    /**
     * Op 06: GET /api/partners/customers
     */
    list: async (): Promise<ApiResponse<PartnerCustomerItem[]>> => {
      return apiClient.get<ApiResponse<PartnerCustomerItem[]>>("/partners/customers");
    },
  },

  // --------------------------------------------------------------------------
  // 3. Services & Dynamic Forms (Ops 07, 08)
  // --------------------------------------------------------------------------
  services: {
    /**
     * Op 07: GET /api/partners/services
     * Returns list of all active services. Search and category filter are handled client-side.
     */
    listActive: async (): Promise<ApiResponse<PartnerCatalogService[]>> => {
      return apiClient.get<ApiResponse<PartnerCatalogService[]>>("/partners/services");
    },

    /**
     * Op 08: GET /api/partners/services/{serviceId}/application-form
     */
    getApplicationForm: async (serviceId: number | string): Promise<ApiResponse<ApplicationFormVersionData>> => {
      return apiClient.get<ApiResponse<ApplicationFormVersionData>>(`/partners/services/${serviceId}/application-form`);
    },
  },

  // --------------------------------------------------------------------------
  // 4. Document Uploads (Ops 09, 10)
  // --------------------------------------------------------------------------
  uploads: {
    /**
     * Op 09: POST /api/partners/customers/{customerId}/services/{serviceId}/documents
     * Multipart: file (PDF, PNG, JPEG, max 10MB), fieldKey (Text), formVersionId (Text optional)
     */
    uploadDocument: async (
      customerId: number | string,
      serviceId: number | string,
      fieldKey: string,
      file: File,
      formVersionId?: number | string
    ): Promise<ApiResponse<ApplicationDocumentUploadResponse>> => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fieldKey", fieldKey);
      if (formVersionId) {
        formData.append("formVersionId", String(formVersionId));
      }

      return apiClient.post<ApiResponse<ApplicationDocumentUploadResponse>>(
        `/partners/customers/${customerId}/services/${serviceId}/documents`,
        formData
      );
    },

    /**
     * Op 10: DELETE /api/partners/uploads/{uploadId}
     * Deletes an unattached upload. Attached uploads return 409 Conflict.
     */
    deleteUpload: async (uploadId: number | string): Promise<ApiResponse<null>> => {
      return apiClient.delete<ApiResponse<null>>(`/partners/uploads/${uploadId}`);
    },
  },

  // --------------------------------------------------------------------------
  // 5. Drafts Management (Ops 13, 14, 15, 16, 17, 18)
  // --------------------------------------------------------------------------
  drafts: {
    /**
     * Op 13: POST /api/partners/customers/{customerId}/service-request-drafts
     */
    create: async (
      customerId: number | string,
      payload: DirectSubmitApplicationPayload
    ): Promise<ApiResponse<ServiceRequestDraftData>> => {
      return apiClient.post<ApiResponse<ServiceRequestDraftData>>(
        `/partners/customers/${customerId}/service-request-drafts`,
        payload
      );
    },

    /**
     * Op 14: GET /api/partners/customers/{customerId}/service-request-drafts
     */
    listForCustomer: async (customerId: number | string): Promise<ApiResponse<ServiceRequestDraftData[]>> => {
      return apiClient.get<ApiResponse<ServiceRequestDraftData[]>>(
        `/partners/customers/${customerId}/service-request-drafts`
      );
    },

    /**
     * Op 15: GET /api/partners/customers/{customerId}/service-request-drafts/{draftId}
     */
    getById: async (
      customerId: number | string,
      draftId: number | string
    ): Promise<ApiResponse<ServiceRequestDraftData>> => {
      return apiClient.get<ApiResponse<ServiceRequestDraftData>>(
        `/partners/customers/${customerId}/service-request-drafts/${draftId}`
      );
    },

    /**
     * Op 16: PUT /api/partners/customers/{customerId}/service-request-drafts/{draftId}
     * Must send expectedVersion matching latest draft.version
     */
    update: async (
      customerId: number | string,
      draftId: number | string,
      payload: DirectSubmitApplicationPayload & { expectedVersion: number }
    ): Promise<ApiResponse<ServiceRequestDraftData>> => {
      return apiClient.put<ApiResponse<ServiceRequestDraftData>>(
        `/partners/customers/${customerId}/service-request-drafts/${draftId}`,
        payload
      );
    },

    /**
     * Op 17: DELETE /api/partners/customers/{customerId}/service-request-drafts/{draftId}
     */
    delete: async (customerId: number | string, draftId: number | string): Promise<ApiResponse<null>> => {
      return apiClient.delete<ApiResponse<null>>(
        `/partners/customers/${customerId}/service-request-drafts/${draftId}`
      );
    },

    /**
     * Op 18: POST /api/partners/customers/{customerId}/service-request-drafts/{draftId}/submit
     * Submits draft to admin queue. expectedVersion is draft.version.
     */
    submit: async (
      customerId: number | string,
      draftId: number | string,
      expectedVersion: number
    ): Promise<ApiResponse<ServiceRequestSummary>> => {
      return apiClient.post<ApiResponse<ServiceRequestSummary>>(
        `/partners/customers/${customerId}/service-request-drafts/${draftId}/submit`,
        { expectedVersion }
      );
    },
  },

  // --------------------------------------------------------------------------
  // 6. Direct Submission & Tracking (Ops 11, 12, 19, 20, 21)
  // --------------------------------------------------------------------------
  requests: {
    /**
     * Op 11: POST /api/partners/customers/{customerId}/service-requests
     * Direct submit without draft. Creates PENDING task. No idempotency key.
     */
    directSubmit: async (
      customerId: number | string,
      payload: DirectSubmitApplicationPayload
    ): Promise<ApiResponse<ServiceRequestSummary>> => {
      return apiClient.post<ApiResponse<ServiceRequestSummary>>(
        `/partners/customers/${customerId}/service-requests`,
        payload
      );
    },

    /**
     * Op 12: GET /api/partners/customers/{customerId}/service-requests
     */
    listForCustomer: async (customerId: number | string): Promise<ApiResponse<ServiceRequestSummary[]>> => {
      return apiClient.get<ApiResponse<ServiceRequestSummary[]>>(
        `/partners/customers/${customerId}/service-requests`
      );
    },

    /**
     * Op 19: GET /api/partners/service-requests
     * Paginated (page, size 1..100) with optional filters: status, assignmentStatus, serviceId, customerId
     */
    listAll: async (params?: {
      page?: number;
      size?: number;
      status?: string;
      assignmentStatus?: "ASSIGNED" | "UNASSIGNED";
      serviceId?: number;
      customerId?: number;
    }): Promise<ApiResponse<PaginatedServiceRequestsList>> => {
      return apiClient.get<ApiResponse<PaginatedServiceRequestsList>>("/partners/service-requests", params);
    },

    /**
     * Op 20: GET /api/partners/service-requests/{taskId}
     * Returns full request details, answers, document references, and history
     */
    getDetails: async (taskId: number | string): Promise<ApiResponse<ServiceRequestDetailData>> => {
      return apiClient.get<ApiResponse<ServiceRequestDetailData>>(`/partners/service-requests/${taskId}`);
    },

    /**
     * Op 21: PUT /api/partners/service-requests/{taskId}/application
     * Corrects answers/documents when status is PENDING_FROM_CLIENT.
     * expectedVersion MUST be detail.submissionVersion (NOT task.version).
     */
    correctApplication: async (
      taskId: number | string,
      payload: DirectSubmitApplicationPayload & { expectedVersion: number }
    ): Promise<ApiResponse<ServiceRequestSummary>> => {
      return apiClient.put<ApiResponse<ServiceRequestSummary>>(
        `/partners/service-requests/${taskId}/application`,
        payload
      );
    },
  },

  // --------------------------------------------------------------------------
  // 7. Protected Binary File Downloads (Ops 22, 23, 24)
  // --------------------------------------------------------------------------
  documents: {
    /**
     * Op 22: GET /api/request-documents/{documentId}
     * Reads original application upload file as binary PDF/image with Bearer token.
     */
    readOriginalFile: async (documentId: number | string, inline: boolean = true) => {
      return apiClient.fetchBlob(`/request-documents/${documentId}`, inline);
    },

    /**
     * Op 23: GET /api/partners/service-requests/{taskId}/documents
     * Lists task collaboration files (work deliverables, chat attachments, partner responses)
     */
    listTaskFiles: async (taskId: number | string): Promise<ApiResponse<TaskCollaborationFileItem[]>> => {
      return apiClient.get<ApiResponse<TaskCollaborationFileItem[]>>(
        `/partners/service-requests/${taskId}/documents`
      );
    },

    /**
     * Op 24: GET /api/partners/service-requests/{taskId}/documents/{fileId}
     * Downloads/previews task file as binary stream with Bearer token.
     */
    downloadTaskFile: async (taskId: number | string, fileId: number | string, inline: boolean = true) => {
      return apiClient.fetchBlob(`/partners/service-requests/${taskId}/documents/${fileId}`, inline);
    },
  },

  // --------------------------------------------------------------------------
  // 8. Task Collaboration Chat (Ops 25, 26)
  // --------------------------------------------------------------------------
  chat: {
    /**
     * Op 25: GET /api/partners/service-requests/{taskId}/messages
     * Polling with afterId & size.
     */
    getMessages: async (
      taskId: number | string,
      params: { afterId?: number; size?: number } = { afterId: 0, size: 20 }
    ): Promise<ApiResponse<{ items: TaskChatMessageItem[]; hasMore: boolean; nextAfterId: number }>> => {
      return apiClient.get<ApiResponse<{ items: TaskChatMessageItem[]; hasMore: boolean; nextAfterId: number }>>(
        `/partners/service-requests/${taskId}/messages`,
        params
      );
    },

    /**
     * Op 25 (Exhaustive fetcher helper): Polls immediately while hasMore === true
     */
    fetchAllMessages: async (taskId: number | string): Promise<TaskChatMessageItem[]> => {
      const all: TaskChatMessageItem[] = [];
      let currentAfterId = 0;
      let hasMore = true;

      while (hasMore) {
        const res = await partnerPortalService.chat.getMessages(taskId, { afterId: currentAfterId, size: 50 });
        if (res?.data?.items && Array.isArray(res.data.items)) {
          all.push(...res.data.items);
          hasMore = Boolean(res.data.hasMore);
          currentAfterId = res.data.nextAfterId || (res.data.items[res.data.items.length - 1]?.id ?? 0);
          if (!res.data.hasMore || res.data.items.length === 0) break;
        } else {
          break;
        }
      }

      return all;
    },

    /**
     * Op 26: POST /api/partners/service-requests/{taskId}/messages
     * Multipart: text (optional if attachment present), attachment (optional PDF/PNG/JPEG max 10MB)
     */
    sendMessage: async (
      taskId: number | string,
      text?: string,
      attachment?: File
    ): Promise<ApiResponse<TaskChatMessageItem>> => {
      const formData = new FormData();
      if (text) formData.append("text", text);
      if (attachment) formData.append("attachment", attachment);

      return apiClient.post<ApiResponse<TaskChatMessageItem>>(
        `/partners/service-requests/${taskId}/messages`,
        formData
      );
    },
  },

  // --------------------------------------------------------------------------
  // 9. Document Requests Fulfillment (Ops 27, 28, 29)
  // --------------------------------------------------------------------------
  documentRequests: {
    /**
     * Op 27: GET /api/partners/service-requests/{taskId}/document-requests
     * Find outstanding document requests. Client should filter OPEN items.
     */
    list: async (taskId: number | string): Promise<ApiResponse<OutstandingDocumentRequest[]>> => {
      return apiClient.get<ApiResponse<OutstandingDocumentRequest[]>>(
        `/partners/service-requests/${taskId}/document-requests`
      );
    },

    /**
     * Op 28: POST /api/partners/service-requests/{taskId}/document-requests/{requestId}/documents
     * Multipart: file (PDF/PNG/JPEG), itemKey (Text). Returns fileId (id).
     */
    uploadItem: async (
      taskId: number | string,
      requestId: number | string,
      itemKey: string,
      file: File
    ): Promise<ApiResponse<TaskCollaborationFileItem>> => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("itemKey", itemKey);

      return apiClient.post<ApiResponse<TaskCollaborationFileItem>>(
        `/partners/service-requests/${taskId}/document-requests/${requestId}/documents`,
        formData
      );
    },

    /**
     * Op 29: POST /api/partners/service-requests/{taskId}/document-requests/{requestId}/submit
     * ExpectedVersion is documentRequest.version. Every item must have a fileId before submit.
     */
    submit: async (
      taskId: number | string,
      requestId: number | string,
      expectedVersion: number,
      documents: Array<{ itemKey: string; fileId: number }>
    ): Promise<ApiResponse<OutstandingDocumentRequest>> => {
      return apiClient.post<ApiResponse<OutstandingDocumentRequest>>(
        `/partners/service-requests/${taskId}/document-requests/${requestId}/submit`,
        {
          expectedVersion,
          documents,
        }
      );
    },
  },

  // --------------------------------------------------------------------------
  // 10. Completion & Certificates (Op 30)
  // --------------------------------------------------------------------------
  completion: {
    /**
     * Op 30: GET /api/partners/service-requests/{taskId}/completion
     * Returns task completion record, licence metadata and certificate download attachments.
     */
    getDetails: async (taskId: number | string): Promise<ApiResponse<TaskCompletionData>> => {
      return apiClient.get<ApiResponse<TaskCompletionData>>(
        `/partners/service-requests/${taskId}/completion`
      );
    },
  },
};
