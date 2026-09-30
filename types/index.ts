/**
 * Finsocap Dashboard - Unified Type Definitions
 * Centralized TypeScript definitions for the entire application.
 */

// ============================================================================
// 1. User & Authentication
// ============================================================================
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "WRITER" | string;
  status?: "APPROVED" | "PENDING" | "REJECTED" | string;
  department?: string;
  phone?: string;
  image?: string;
  createdAt?: string;
  lastActive?: string;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string | null;
}

export interface AuthSession {
  user: SessionUser;
  expires: string;
}

// ============================================================================
// 2. Blog & Content Management
// ============================================================================
export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  thumbnail?: string;
  category?: BlogCategory;
  categoryId?: string;
  seoTitle?: string;
  seoDesc?: string;
  tags?: string;
  status?: "PUBLISHED" | "DRAFT" | "SCHEDULED" | string;
  publishedAt?: string | null;
  scheduledAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  views?: number;
  author?: {
    name: string;
  };
}

// ============================================================================
// 3. Notifications & Activity
// ============================================================================
export interface NotificationItem {
  id: string;
  type: "chat" | "support" | "blog" | "task" | "social" | "payment" | "invoice" | "service" | "compliance";
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  actionUrl: string;
}

// ============================================================================
// 4. Real-time Team & Visitor Chat
// ============================================================================
export interface ChatUser {
  id: string;
  name: string;
  role: string;
  image?: string | null;
  lastSeen?: string;
  isOnline?: boolean;
}

export interface Group {
  id: string;
  name: string;
  createdBy: string;
  members: { user: ChatUser }[];
}

export interface Message {
  id: string;
  senderId: string;
  receiverId?: string;
  groupId?: string;
  message: string;
  createdAt: string;
  sender?: {
    id: string;
    name: string;
    image?: string | null;
  };
  isDeleted?: boolean;
  deletedFor?: string;
  isDelivered?: boolean;
  isRead?: boolean;
}

// ============================================================================
// 5. White-label & Brand Configuration (Dev Team Controls)
// ============================================================================
export type AvailableFont =
  | "Inter"
  | "Outfit"
  | "Plus Jakarta Sans"
  | "Poppins"
  | "Roboto"
  | "Geist";

export type ThemeMode = "light" | "dark" | "system";

export interface ThemeColors {
  primary: string;
  primaryHover: string;
  accent: string;
  accentHover: string;
  accentSubtle: string;
}

export interface PresetTheme {
  id: string;
  name: string;
  description: string;
  fontFamily: AvailableFont;
  colors: ThemeColors;
}

export interface BrandConfig {
  companyName: string;
  shortName: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
  fontFamily: AvailableFont;
  defaultMode: ThemeMode;
  colors: ThemeColors;
  presets: Record<string, PresetTheme>;
}

// ============================================================================
// 6. Products & Services Master Catalog
// ============================================================================
export interface ServiceDocument {
  id: string;
  name: string;
  type: "Required" | "Optional";
}

export interface ServiceLink {
  id: string;
  title: string;
  url: string;
}

export interface ServiceMaterial {
  id: string;
  title: string;
  fileUrl: string;
}

export interface ServiceFaq {
  id: string;
  question: string;
  answer: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  category: string;
  description: string;
  recurring: "Yes" | "No";
  frequency: "One Time" | "Monthly" | "Yearly" | "Quarterly";
  price: number;
  governmentFee: number;
  processingTime: string;
  status: "Active" | "Inactive" | "Draft";
  isPopular?: boolean;
  content?: string;
  highlights?: string[];
  steps?: string[];
  eligibility?: string;
  documents?: ServiceDocument[];
  usefulLinks?: ServiceLink[];
  videoLink?: string;
  studyMaterials?: ServiceMaterial[];
  faqs?: ServiceFaq[];
  createdAt?: string;
}

// ============================================================================
// 7. Operations & Tasks Management (Partner -> Admin -> Employee)
// ============================================================================
export type TaskStatus =
  | "Pending"
  | "In Progress"
  | "Sent for Review"
  | "Pending from Client"
  | "Pending from Department"
  | "Overdue"
  | "Completed"
  | "Cancelled";

export interface TaskComment {
  id: string;
  userName: string;
  userRole: string;
  userAvatar?: string;
  timestamp: string;
  text: string;
}

export interface TaskAttachment {
  id: string;
  fileName: string;
  fileSize?: string;
  fileType?: string;
  uploadDate: string;
  uploadedBy: string;
  fileUrl: string;
}

export interface TaskStatusHistory {
  id: string;
  status: TaskStatus;
  title: string;
  description?: string;
  timestamp: string;
  updatedBy?: string;
}

export interface TaskItem {
  id: string;
  partnerName: string;
  partnerContact: string;
  clientName: string;
  clientContact: string;
  nameOfBusiness: string;
  taskCategory: string;
  serviceName: string;
  status: TaskStatus;
  taskDate: string;
  dueDate: string;
  overdueDays?: number;
  assignedTo?: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
  };
  comments?: TaskComment[];
  attachments?: TaskAttachment[];
  statusHistory?: TaskStatusHistory[];
}

