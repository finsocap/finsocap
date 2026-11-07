/**
 * FinSoCap Admin Platform - REST API Types
 * Direct mappings to the Spring Boot REST API Specification DTOs
 */

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
}

// Module 0: Auth
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponseData {
  token: string;
  tokenType: "Bearer" | string;
  id: number;
  email: string;
  role: "ADMIN" | string;
  name: string;
  status: "ACTIVE" | string;
}

// Module 1: Workload & Task Delegation
export interface SpecialistWorkload {
  id: number;
  employeeCode: string;
  
  name: string;
  role: string;
  activeTasks: number;
  maxCapacity: number;
  utilizationPercentage: number;
  loadStatus: "OPTIMAL" | "OVERLOADED" | "AVAILABLE" | string;
}

export interface WorkloadMetrics {
  specialists: SpecialistWorkload[];
  unassignedRequestsCount: number;
  assignedTasksCount: number;
  inProgressWipCount: number;
  completedDoneCount: number;
}

export interface BalancingRecommendation {
  recommendationId: string;
  title: string;
  description: string;
  suggestedSpecialist: string;
  targetSpecialistCode: string;
  affectedCaseCount: number;
}

export interface AssignTaskRequest {
  taskId: number;
  specialistId: number;
  notes?: string;
}

export interface DelegationListItem {
  id: number;
  taskId: string;
  serviceName: string;
  clientName: string;
  status: string;
}

// Module 2: Tasks Operations & Kanban
export interface TaskMetrics {
  totalTasks: number;
  pendingReview: number;
  inProgress: number;
  queryRaised: number;
  completed: number;
}

export type BackendTaskStatus = "PENDING" | "IN_PROGRESS" | "PENDING_FROM_CLIENT" | "COMPLETED";

export interface BackendTask {
  id: number;
  taskId: string;
  partnerId?: string;
  partnerName?: string;
  partnerContact?: string;
  clientName: string;
  contactNumber?: string;
  nameOfBusiness?: string;
  taskCategory?: string;
  serviceName: string;
  status: BackendTaskStatus | string;
  priority?: "NORMAL" | "HIGH" | "URGENT" | string;
  taskDate?: string;
  dueDate?: string;
  assignedToName?: string;
  assignedToId?: number | null;
  professionalFee?: number;
  adminRemarks?: string;
}

export interface TaskQueryParams {
  startDate?: string;
  endDate?: string;
  status?: BackendTaskStatus;
  search?: string;
}

export interface UpdateTaskPayload {
  status?: BackendTaskStatus | string;
  assignedToSpecialistId?: number;
  dueDate?: string;
  adminRemarks?: string;
}

export interface RaiseQueryPayload {
  queryRemarks: string;
  requiredDocs: string[];
}

// Module 3: Franchise Partner Network
export interface PartnerMetrics {
  totalPartners: number;
  activePartners: number;
  pendingApplications: number;
  totalNetworkRevenue: number;
}

export type FranchiseTier = "STANDARD_FRANCHISE" | "GOLD_FRANCHISE" | "PLATINUM_FRANCHISE" | string;
export type PartnerStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";

export interface PartnerSummary {
  id: number;
  partnerId: string;
  name: string;
  email: string;
  phone: string;
  hubLocation: string;
  franchiseTier: FranchiseTier;
  activeTasks: number;
  totalCasesSubmitted: number;
  totalEarnedCommission: number;
  status: PartnerStatus;
  panCardUrl?: string;
  shopPhotoUrl?: string;
}

export interface PartnerEnrollPayload {
  name: string;
  email: string;
  phone: string;
  password?: string;
  temporaryPassword?: string;
  address: string;
  hubLocation: string;
  franchiseTier: FranchiseTier;
  panNumber: string;
  adhaarNumber: string;
}

// Module 4: Clients CRM & Profiles
export interface ClientMetrics {
  totalClients: number;
  privateLimited: number;
  proprietorships: number;
  partnershipsAndLlps: number;
}

export type ConstitutionType = "PROPRIETORSHIP" | "PARTNERSHIP" | "LLP" | "PRIVATE_LTD_OPC" | "PUBLIC_LTD" | string;

export interface ClientProfile {
  id: number;
  name: string;
  phone: string;
  email: string;
  businessName: string;
  constitutionType: ConstitutionType;
  partnerName?: string;
  partnerCode?: string;
  serviceCases?: number;
  latestStatus?: string;
}

export interface ClientHistoryItem {
  id: number;
  taskId: string;
  serviceName: string;
  status: string;
  taskDate: string;
}

export interface CreateClientPayload {
  name: string;
  phone: string;
  email: string;
  businessName: string;
  constitutionType: ConstitutionType;
}

// Module 5: Team & Specialist Directory
export interface TeamMetrics {
  totalSpecialists: number;
  operationsTeam: number;
  legalTeam: number;
  accountingTeam: number;
  avgUtilization: number;
}

export interface Specialist {
  id: number;
  employeeCode: string;
  fullName: string;
  designation: string;
  department: "OPERATIONS" | "LEGAL" | "ACCOUNTING" | string;
  departmentId?: number;
  serviceIds?: number[];
  email: string;
  phone: string;
  activeTasks: number;
  maxCapacity: number;
  utilizationPercentage: number;
  competencies: string[];
}

export interface EnrollSpecialistPayload {
  fullName: string;
  designation: string;
  departmentId?: number;
  department?: string;
  role?: string;
  email?: string;
  phone?: string;
  defaultPassword?: string;
  serviceIds?: number[];
  maxCapacity?: number;
  competencies?: string[];
}

// Module 6: Products & Services Catalog
export type BackendServiceCategory =
  | "FOOD_BEVERAGE"
  | "LICENSES"
  | "LEGAL_IP"
  | "TAXATION"
  | "COMPANY_REG";

export function normalizeServiceCategory(cat: string): BackendServiceCategory {
  const c = (cat || "").toUpperCase().replace(/[^A-Z]/g, "_");
  if (c.includes("FOOD") || c.includes("BEVERAGE") || c.includes("FSSAI") || c.includes("RESTAURANT")) return "FOOD_BEVERAGE";
  if (c.includes("LICENSE") || c.includes("LICENCE") || c.includes("PERMIT") || c.includes("TRADE") || c.includes("MUNICIPAL")) return "LICENSES";
  if (c.includes("LEGAL") || c.includes("IP") || c.includes("PROPERTY") || c.includes("TRADEMARK") || c.includes("COPYRIGHT") || c.includes("PATENT")) return "LEGAL_IP";
  if (c.includes("TAX") || c.includes("GST") || c.includes("ACCOUNT") || c.includes("ITR") || c.includes("AUDIT")) return "TAXATION";
  if (c.includes("COMPANY") || c.includes("REG") || c.includes("COMPLIANCE") || c.includes("BUSINESS") || c.includes("IMPORT") || c.includes("EXPORT") || c.includes("GROWTH")) return "COMPANY_REG";
  return "COMPANY_REG";
}

export interface CatalogService {
  id: number;
  name: string;
  category: BackendServiceCategory | string;
  subtitle?: string;
  badges?: string[];
  startingClientPrice: number;
  partnerProfit?: number;
  partnerCommission?: number;
  processingTime?: string;
  estimatedTurnaroundDays?: number;
  overviewHtml?: string;
  eligibilityCriteria?: string;
  keyFeatures?: string[];
  workflowSteps?: string[];
  requiredDocuments?: string[];
  requiredDocs?: string[];
  officialGovernmentPortalLinks?: string[];
  trainingVideoTutorials?: string[];
  studyMaterials?: string[];
  faqs?: string[];
  contentDetails?: string;
  yearWiseFeesEnabled?: boolean;
  yearWiseFees?: YearWiseFeeItem[];
  sopsJson?: string | null;
  faqsJson?: string | null;
  pricingTiersJson?: string | null;
  recurring?: "YES" | "NO" | string;
  frequency?: "YEARLY" | "MONTHLY" | "QUARTERLY" | "ONE_TIME" | string | null;
  baseGovernmentFee?: string | number;
  active: boolean;
}

export interface YearWiseFeeItem {
  year: string;
  governmentFee: string | number;
  professionalFee: string | number;
  total: string | number;
}

export interface CreateServicePayload {
  name: string;
  category: BackendServiceCategory | string;
  categoryId?: number;
  subtitle?: string;
  startingClientPrice: number;
  partnerProfit?: number;
  partnerCommission?: number;
  processingTime?: string;
  estimatedTurnaroundDays?: number;
  overviewHtml?: string;
  eligibilityCriteria?: string;
  badges?: string[];
  keyFeatures?: string[];
  workflowSteps?: string[];
  requiredDocuments?: string[];
  requiredDocs?: string[];
  officialGovernmentPortalLinks?: string[];
  trainingVideoTutorials?: string[];
  studyMaterials?: string[];
  faqs?: string[];
  contentDetails?: string;
  yearWiseFeesEnabled?: boolean;
  yearWiseFees?: YearWiseFeeItem[];
  sopsJson?: string | null;
  faqsJson?: string | null;
  pricingTiersJson?: string | null;
  recurring?: "YES" | "NO" | string;
  frequency?: "YEARLY" | "MONTHLY" | "QUARTERLY" | "ONE_TIME" | string | null;
  baseGovernmentFee?: string | number;
}

// Module 7: Reports & Compliance Intelligence (Licences Vault)
export interface SpecialistReportRow {
  employeeId: string;
  employeeName: string;
  assigned: number;
  completed: number;
  totalFees: number;
}

export interface SpecialistReport {
  totalEmployees: number;
  totalTasks: number;
  rows: SpecialistReportRow[];
}

export interface PartnerReportRow {
  partnerId: string;
  partnerName: string;
  totalClients: number;
  totalTasks: number;
  completedTasks: number;
  receivedAmount: number;
}

export interface PartnerReport {
  totalFranchisePartners: number;
  totalTasks: number;
  rows: PartnerReportRow[];
}

export interface LicenceRegistryRow {
  id: number;
  taskId: string;
  partnerName: string;
  clientName: string;
  portalUserId: string;
  portalPasswordMasked: string;
  licenceNumber: string;
  issueDate: string;
  expiryDate: string;
  status: "ACTIVE" | "EXPIRING_SOON" | "EXPIRED" | string;
  serviceCategory?: string;
  governmentPortalUrl?: string;
  certificateUrl?: string;
}

export interface LicenceReportMetrics {
  totalLicences: number;
  active: number;
  expiringIn30Days: number;
  expired: number;
  urlLinked?: number;
  urlNotLinked?: number;
  rows: LicenceRegistryRow[];
}

export interface RegisterLicencePayload {
  taskId: string;
  partnerName: string;
  clientName: string;
  serviceCategory: string;
  governmentPortalUrl: string;
  portalUserId: string;
  portalPassword: string;
  licenceNumber: string;
  issueDate: string;
  expiryDate: string;
}

export interface RevealPasswordResponse {
  licenceId: number;
  portalUserId: string;
  portalPasswordDecrypted: string;
}

// Module 8: Message Center & Support
export interface ConversationItem {
  id: number;
  title: string;
  type: "DIRECT" | "GROUP" | string;
  participantName: string;
  participantRole: string;
  participantPhone?: string;
  participantEmail?: string;
  participantLocation?: string;
  lastMessage: string;
  unreadCount: number;
  isOnline?: boolean;
  isPinned?: boolean;
  lastMessageTime?: string;
}

export interface ChatMessageItem {
  id: number;
  senderName: string;
  senderRole: string;
  isFromAdmin: boolean;
  messageText: string;
  timestamp: string;
  attachmentUrl?: string;
}

export interface CreateConversationPayload {
  title: string;
  type: "DIRECT" | "GROUP";
  participantName: string;
  participantRole: "CLIENT" | "PARTNER" | "SPECIALIST" | "ADMIN" | string;
  participantPhone?: string;
  participantEmail?: string;
  participantLocation?: string;
  initialMessage: string;
}

// ============================================================================
// Module 9: Partner Customers, Service Requests & Dynamic Workflow Form Engine
// ============================================================================

export interface PartnerCustomer {
  id: number;
  name: string;
  phone: string;
  email: string;
  businessName: string;
  constitutionType: "SOLE_PROPRIETORSHIP" | "PARTNERSHIP" | "PRIVATE_LIMITED" | "LLP" | "PUBLIC_LIMITED" | "TRUST" | "SOCIETY" | string;
  createdAt?: string;
  activeRequestsCount?: number;
}

export interface CreateCustomerPayload {
  name: string;
  phone: string;
  email: string;
  businessName: string;
  constitutionType: string;
}

export interface DocumentSlotRule {
  fieldKey: string;
  label: string;
  required: boolean;
  mimeTypes: string[];
  maxBytes: number;
  maxFiles: number;
  requiredWhen?: Record<string, any>;
}

export interface ApplicationFormVersion {
  id?: number;
  formVersionId?: number;
  serviceId: number;
  version?: number;
  revision?: number;
  published: boolean;
  schema: Record<string, any>;
  ui?: Record<string, any>;
  documents?: DocumentSlotRule[];
  createdAt?: string;
  publishedAt?: string;
}

export interface CreateApplicationFormPayload {
  schema: Record<string, any>;
  ui?: Record<string, any>;
  documents?: DocumentSlotRule[];
}

export interface DocumentUploadResponse {
  uploadId: number;
  fieldKey: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  downloadUrl: string;
}

export interface DirectServiceRequestPayload {
  serviceId: number;
  formVersionId?: number | null;
  answers?: Record<string, any>;
  documents?: Array<{ fieldKey: string; uploadId: number }>;
  instructions?: string;
}

export interface ServiceRequestDraft {
  id: number;
  serviceId: number;
  customerId: number;
  formVersionId?: number;
  version: number;
  answers: Record<string, any>;
  documents: Array<{ fieldKey: string; uploadId: number; fileName?: string }>;
  instructions?: string;
  updatedAt?: string;
}

export interface ServiceRequestItem {
  id: number;
  requestCode: string;
  version: number;
  customerId: number;
  customerName: string;
  partnerId: number;
  partnerName: string;
  serviceId: number;
  serviceName: string;
  status: "PENDING" | "IN_PROGRESS" | "PENDING_FROM_CLIENT" | "PENDING_FROM_DEPARTMENT" | "SENT_FOR_REVIEW" | "COMPLETED" | "CANCELLED" | string;
  assignmentStatus: "ASSIGNED" | "UNASSIGNED" | string;
  assignedTo?: {
    id: number;
    fullName: string;
    email?: string;
    designation?: string;
  } | null;
  priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT" | string;
  dueDate?: string | null;
  createdAt?: string;
  fee?: number;
  amountPending?: number;
  instructions?: string;
  answers?: Record<string, any>;
  documents?: Array<{
    uploadId: number;
    fieldKey: string;
    fileName: string;
    downloadUrl?: string;
    sizeBytes?: number;
  }>;
  queryMessage?: string | null;
  adminRemarks?: string | null;
  history?: Array<{
    id?: number;
    actor?: string;
    oldStatus?: string;
    newStatus?: string;
    note?: string;
    timestamp?: string;
  }>;
}

export interface PaginatedServiceRequests {
  items: ServiceRequestItem[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export interface AssignServiceRequestPayload {
  specialistId: number | null;
  expectedVersion: number;
  priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT" | string;
  dueDate?: string;
  notes?: string;
  overrideCompetency?: boolean;
}

export interface UpdateServiceRequestStatusPayload {
  status: "IN_PROGRESS" | "PENDING_FROM_CLIENT" | "PENDING_FROM_DEPARTMENT" | "SENT_FOR_REVIEW" | "COMPLETED" | "CANCELLED" | string;
  expectedVersion: number;
  note?: string;
}

