export interface PaymentVerificationItem {
  id: string | number;
  requestCode: string;
  applicationId: string;
  partnerId: string | number;
  partnerName: string;
  partnerPhone?: string;
  customerName: string;
  serviceName: string;
  serviceCategory?: string;
  totalServiceFee: number; // e.g. 1149
  partnerPaymentAmount: number; // e.g. 1149
  partnerEarning: number; // e.g. 600
  submittedUtr?: string; // 12-digit UTR
  paymentScreenshotUrl?: string;
  status: "PAYMENT_NOT_REQUESTED" | "PAYMENT_REQUESTED" | "PAYMENT_REQUIRED" | "VERIFICATION_PENDING" | "PAYMENT_RECEIVED" | "REJECTED";
  requestSentAt?: string;
  detailsSharedAt?: string;
  taskStatus?: string;
  taskCompletedAt?: string;
  submittedAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
  certificateReleased: boolean;
  certificateUrl?: string;
  licenceNumber?: string;
}

export interface SubmitPaymentPayload {
  taskId: string | number;
  requestCode?: string;
  utrNumber: string;
  screenshotFile?: File | string;
  screenshotUrl?: string;
  notes?: string;
}

export interface VerifyPaymentPayload {
  taskId: string | number;
  paymentId?: string | number;
  status: "RECEIVED" | "REJECTED";
  rejectionReason?: string;
}

