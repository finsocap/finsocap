import { apiClient, getAuthToken } from "./apiClient";
import { ApiResponse } from "@/types/api";
import {
  AdminPaymentSettings,
  TaskPaymentRequestItem,
  PaginatedPaymentRequests,
  SendPaymentRequestPayload,
  ConfirmPaymentPayload,
} from "@/types/paymentWorkflow";

export const paymentWorkflowService = {
  /**
   * 1. GET /api/admin/payment-settings
   * Retrieves admin UPI & QR setup.
   */
  getPaymentSettings: async (): Promise<ApiResponse<AdminPaymentSettings>> => {
    return apiClient.get<ApiResponse<AdminPaymentSettings>>("/admin/payment-settings");
  },

  /**
   * 2. POST /api/admin/payment-settings
   * Uploads admin QR + UPI once using multipart form-data.
   * Body: upiId (text), payeeName (text), qr (binary file)
   */
  savePaymentSettings: async (formData: FormData): Promise<ApiResponse<AdminPaymentSettings>> => {
    return apiClient.post<ApiResponse<AdminPaymentSettings>>("/admin/payment-settings", formData);
  },

  /**
   * 2b. PUT /api/admin/payment-settings
   * Updates / re-uploads admin QR + UPI using multipart form-data.
   * Key: upiId (Text), payeeName (Text), qr (File - PNG/JPEG max 2MB)
   */
  updatePaymentSettings: async (formData: FormData): Promise<ApiResponse<AdminPaymentSettings>> => {
    return apiClient.put<ApiResponse<AdminPaymentSettings>>("/admin/payment-settings", formData);
  },

  /**
   * 3. GET /api/admin/payment-settings/qr
   * Retrieves raw QR image bytes as a Blob object with Bearer token.
   */
  getAdminQrBlob: async (): Promise<Blob | null> => {
    try {
      const token = getAuthToken();
      // If running in browser, fetch through local proxy to avoid browser CORS/cross-origin headers
      const targetUrl =
        typeof window !== "undefined"
          ? "/api/proxy/admin/payment-settings/qr"
          : `${(process.env.NEXT_PUBLIC_API_BASE_URL || "https://finsocap.cloud/api").replace(/\/+$/, "")}/admin/payment-settings/qr`;

      const res = await fetch(targetUrl, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) return null;
      return await res.blob();
    } catch (e) {
      console.error("[paymentWorkflowService] getAdminQrBlob error:", e);
      return null;
    }
  },

  /**
   * 4. POST /api/admin/service-requests/{taskId}/payment-request
   * Admin sends payment request for a completed service request.
   */
  sendPaymentRequest: async (
    taskId: number | string,
    payload?: SendPaymentRequestPayload
  ): Promise<ApiResponse<TaskPaymentRequestItem>> => {
    return apiClient.post<ApiResponse<TaskPaymentRequestItem>>(
      `/admin/service-requests/${taskId}/payment-request`,
      payload || {}
    );
  },

  /**
   * 5. GET /api/admin/payment-requests
   * Lists all payment requests with optional filter: status=PENDING | COMPLETED.
   */
  getPaymentRequests: async (params?: {
    status?: "PENDING" | "COMPLETED";
    partnerId?: number;
    customerId?: number;
    page?: number;
    size?: number;
  }): Promise<ApiResponse<PaginatedPaymentRequests>> => {
    return apiClient.get<ApiResponse<PaginatedPaymentRequests>>("/admin/payment-requests", params);
  },

  /**
   * 6. GET /api/admin/payment-requests/{id}
   * Retrieves single payment request details.
   */
  getPaymentRequestById: async (
    id: number | string
  ): Promise<ApiResponse<TaskPaymentRequestItem>> => {
    return apiClient.get<ApiResponse<TaskPaymentRequestItem>>(`/admin/payment-requests/${id}`);
  },

  /**
   * 7. PATCH /api/admin/payment-requests/{id}/status
   * Admin confirms payment (status: "COMPLETED", expectedVersion, transactionReference required).
   * Or admin marks back to "PENDING" to lock documents if mistaken.
   */
  updatePaymentStatus: async (
    id: number | string,
    payload: ConfirmPaymentPayload
  ): Promise<ApiResponse<TaskPaymentRequestItem>> => {
    return apiClient.patch<ApiResponse<TaskPaymentRequestItem>>(
      `/admin/payment-requests/${id}/status`,
      payload
    );
  },
};
