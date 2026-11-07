/**
 * Task Collaboration & Document Exchange Service
 * Specifications from: FINSOCAP - SPECIALIST TASK API GUIDE
 * 
 * Supports:
 * - Admin base: /api/admin/service-requests/{taskId}
 * - Staff base: /api/staff/tasks/{taskId}
 * - Partner base: /api/partners/service-requests/{taskId}
 */

import { apiClient } from "./apiClient";
import { ApiResponse } from "@/types/api";

export interface TaskDocumentItem {
  id: number;
  taskId: number;
  title: string;
  documentType: "CERTIFICATE" | "ACKNOWLEDGEMENT" | "NOTICE" | "CHAT" | "PARTNER_RESPONSE" | "OTHER";
  fileName: string;
  contentType: string;
  sizeBytes: number;
  uploadedBy: string;
  uploadedByRole: "ADMIN" | "STAFF" | "PARTNER";
  createdAt: string;
  documentRequestId?: number | null;
  itemKey?: string | null;
  replacesTaskFileId?: number | null;
  downloadPath: string;
}

export interface TaskChatMessage {
  id: number;
  taskId: number;
  sender: string;
  senderRole: "ADMIN" | "STAFF" | "PARTNER";
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

export interface TaskDocumentRequestItem {
  itemKey: string;
  label: string;
  replacesDocumentId?: number | null;
  replacesTaskFileId?: number | null;
  responseFileId?: number | null;
}

export interface TaskDocumentRequest {
  id: number;
  taskId: number;
  version: number;
  message: string;
  status: "OPEN" | "SUBMITTED" | "CANCELLED";
  requestedBy: string;
  requestedByRole: "ADMIN" | "STAFF";
  createdAt: string;
  items: TaskDocumentRequestItem[];
}

export const taskCollaborationService = {
  /**
   * Helper to resolve base path depending on role:
   * Admin: /api/admin/service-requests/{taskId}
   * Staff: /api/staff/tasks/{taskId}
   */
  getBasePath: (taskId: number | string, role: "ADMIN" | "STAFF" = "ADMIN") => {
    return role === "STAFF"
      ? `/staff/tasks/${taskId}`
      : `/admin/service-requests/${taskId}`;
  },

  /**
   * 1. Upload Work Deliverable (Section 4 & 12)
   * POST {base}/documents
   */
  uploadWorkDocument: async (
    taskId: number | string,
    file: File,
    data: {
      title: string;
      documentType: "CERTIFICATE" | "ACKNOWLEDGEMENT" | "NOTICE" | "OTHER";
      replacesTaskFileId?: number | string;
    },
    role: "ADMIN" | "STAFF" = "ADMIN"
  ): Promise<ApiResponse<TaskDocumentItem>> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", data.title);
    formData.append("documentType", data.documentType);
    if (data.replacesTaskFileId) {
      formData.append("replacesTaskFileId", String(data.replacesTaskFileId));
    }

    const basePath = taskCollaborationService.getBasePath(taskId, role);
    return apiClient.post<ApiResponse<TaskDocumentItem>>(`${basePath}/documents`, formData);
  },

  /**
   * 2. List Task Documents (Section 5 & 12)
   * GET {base}/documents
   */
  listTaskDocuments: async (
    taskId: number | string,
    role: "ADMIN" | "STAFF" = "ADMIN"
  ): Promise<ApiResponse<TaskDocumentItem[]>> => {
    const basePath = taskCollaborationService.getBasePath(taskId, role);
    return apiClient.get<ApiResponse<TaskDocumentItem[]>>(`${basePath}/documents`);
  },

  /**
   * 3. Send Task Chat Message / Comment (Section 7 & 12)
   * POST {base}/messages
   */
  sendChatMessage: async (
    taskId: number | string,
    text: string,
    attachment?: File,
    role: "ADMIN" | "STAFF" = "ADMIN"
  ): Promise<ApiResponse<TaskChatMessage>> => {
    const formData = new FormData();
    formData.append("text", text);
    if (attachment) {
      formData.append("attachment", attachment);
    }

    const basePath = taskCollaborationService.getBasePath(taskId, role);
    return apiClient.post<ApiResponse<TaskChatMessage>>(`${basePath}/messages`, formData);
  },

  /**
   * 4. Read Chat Messages (Section 8 & 12)
   * GET {base}/messages?afterId=0&size=50
   */
  getChatMessages: async (
    taskId: number | string,
    params: { afterId?: number; size?: number } = { afterId: 0, size: 50 },
    role: "ADMIN" | "STAFF" = "ADMIN"
  ): Promise<ApiResponse<{ items: TaskChatMessage[]; hasMore: boolean; nextAfterId: number }>> => {
    const basePath = taskCollaborationService.getBasePath(taskId, role);
    return apiClient.get<ApiResponse<{ items: TaskChatMessage[]; hasMore: boolean; nextAfterId: number }>>(
      `${basePath}/messages`,
      params
    );
  },

  /**
   * 5. Ask Partner for New / Replacement Documents (Section 9 & 12)
   * POST {base}/document-requests
   */
  createDocumentRequest: async (
    taskId: number | string,
    payload: {
      message: string;
      items: Array<{
        label: string;
        replacesDocumentId?: number | null;
        replacesTaskFileId?: number | null;
      }>;
      expectedVersion: number;
    },
    role: "ADMIN" | "STAFF" = "ADMIN"
  ): Promise<ApiResponse<TaskDocumentRequest>> => {
    const basePath = taskCollaborationService.getBasePath(taskId, role);
    return apiClient.post<ApiResponse<TaskDocumentRequest>>(`${basePath}/document-requests`, payload);
  },

  /**
   * 6. Read Document Requests (Section 10 & 12)
   * GET {base}/document-requests
   */
  getDocumentRequests: async (
    taskId: number | string,
    role: "ADMIN" | "STAFF" = "ADMIN"
  ): Promise<ApiResponse<TaskDocumentRequest[]>> => {
    const basePath = taskCollaborationService.getBasePath(taskId, role);
    return apiClient.get<ApiResponse<TaskDocumentRequest[]>>(`${basePath}/document-requests`);
  },

  /**
   * 7. Update Task Status (Section 11 & 12)
   * PATCH {base}/status
   * Supports:
   * - STAFF role: /api/staff/tasks/{taskId}/status (ignores expectedVersion, sends status & note)
   * - ADMIN role: /api/admin/service-requests/{taskId}/status
   */
  updateTaskStatus: async (
    taskId: number | string,
    payload: {
      status: "PENDING" | "IN_PROGRESS" | "SEE_FULL_REVIEW" | "SENT_FOR_REVIEW" | "PENDING_FROM_CLIENT" | "PENDING_FROM_DEPARTMENT" | "COMPLETED" | "CANCELLED" | string;
      note?: string;
      reason?: string;
      decisionNotes?: string;
      expectedVersion?: number;
    },
    role: "ADMIN" | "STAFF" = "ADMIN"
  ): Promise<ApiResponse<any>> => {
    const basePath = taskCollaborationService.getBasePath(taskId, role);
    const body = role === "STAFF"
      ? {
          status: payload.status,
          note: payload.note || "Status updated",
        }
      : {
          status: payload.status,
          reason: payload.reason || payload.note || "Administrative status update",
          decisionNotes: payload.decisionNotes || payload.note || "Administrative status update",
          note: payload.note || "Status updated",
          expectedVersion: typeof payload.expectedVersion === "number" ? payload.expectedVersion : 0,
        };
    return apiClient.patch<ApiResponse<any>>(`${basePath}/status`, body);
  },
};

