/**
 * FinSoCap Task Payment & Document Release Types
 * Matching API Specification (17 November 2026)
 */

export interface AdminPaymentSettings {
  upiId: string;
  payeeName: string;
  qrUrl: string;
  qrContentType?: string;
}

export interface TaskPaymentRequestItem {
  id: number;
  version: number;
  taskId: number;
  requestCode: string;
  partnerId: number;
  partnerName: string;
  customerId: number;
  customerName: string;
  serviceId: number;
  serviceName: string;
  amount: number;
  currency: string;
  status: "PENDING" | "COMPLETED";
  notes?: string | null;
  requestedBy: string;
  createdAt: string;
  paidAt?: string | null;
  confirmedBy?: string | null;
  transactionReference?: string | null;
  documentsUnlocked: boolean;
}

export interface PaginatedPaymentRequests {
  items: TaskPaymentRequestItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface PaymentProofItem {
  id: number;
  paymentId: number;
  taskId: number;
  requestCode?: string;
  partnerId: number;
  partnerName: string;
  customerId: number;
  customerName: string;
  amount: number;
  currency: string;
  paymentStatus: "PENDING" | "COMPLETED";
  utrNumber?: string | null;
  submittedBy: string;
  createdAt: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  screenshotUrl: string;
}

export interface PaginatedPaymentProofs {
  items: PaymentProofItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface SendPaymentRequestPayload {
  notes?: string;
}

export interface ConfirmPaymentPayload {
  status: "COMPLETED" | "PENDING";
  expectedVersion: number;
  transactionReference?: string;
  notes?: string;
}

export interface PartnerPaidDocumentItem {
  id: number;
  taskId: number;
  title: string;
  documentType: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  uploadedBy: string;
  uploadedByRole: string;
  createdAt: string;
  completionId?: number | null;
  documentRequestId?: number | null;
  itemKey?: string | null;
  replacesTaskFileId?: number | null;
  downloadPath: string;
}
