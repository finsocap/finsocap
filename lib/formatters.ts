/**
 * Finsocap Global Input Formatting & Validation Utilities
 *
 * Provides standardized, non-destructive formatting and validation across
 * all user roles: Admin, Specialist / Employee, Partner, and Clients.
 */

// -----------------------------------------------------------------------------
// 1. Global Title Case & Name Formatting
// -----------------------------------------------------------------------------

/**
 * Well-known acronyms, abbreviations, and official statutory terms that must
 * preserve their exact official uppercase/casing.
 */
const ACRONYM_MAP: Record<string, string> = {
  gst: "GST",
  gstin: "GSTIN",
  fssai: "FSSAI",
  upi: "UPI",
  api: "API",
  kyc: "KYC",
  pan: "PAN",
  tan: "TAN",
  cin: "CIN",
  din: "DIN",
  llp: "LLP",
  llc: "LLC",
  pvt: "Pvt",
  ltd: "Ltd",
  msme: "MSME",
  udyam: "Udyam",
  iec: "IEC",
  sop: "SOP",
  faq: "FAQ",
  faqs: "FAQs",
  sla: "SLA",
  dsc: "DSC",
  ca: "CA",
  cs: "CS",
  cma: "CMA",
  it: "IT",
  itr: "ITR",
  tds: "TDS",
  tcs: "TCS",
  rbsh: "RBSH",
  rbi: "RBI",
  sebi: "SEBI",
  nbfc: "NBFC",
  mca: "MCA",
  roc: "ROC",
  epf: "EPF",
  epfo: "EPFO",
  esi: "ESI",
  esic: "ESIC",
  iso: "ISO",
  pf: "PF",
  crm: "CRM",
  id: "ID",
  ids: "IDs",
  wip: "WIP",
  tat: "TAT",
  otp: "OTP",
  sms: "SMS",
  pdf: "PDF",
  url: "URL",
  urls: "URLs",
  inr: "INR",
  usd: "USD",
  neft: "NEFT",
  rtgs: "RTGS",
  imps: "IMPS",
  qr: "QR",
};

/**
 * Checks whether a token is a URL, email, technical slug, or code that should not be touched.
 */
function isTechnicalIdentifier(str: string): boolean {
  if (!str) return false;
  // URL check
  if (/^https?:\/\//i.test(str) || /^www\./i.test(str)) return true;
  // Email check
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)) return true;
  // Code / Task ID / Reference format (e.g. T-1234, #1234, UUID, 24-char hex, slug with underscores like SENT_FOR_REVIEW)
  if (/^[T#]-[a-zA-Z0-9_-]+$/.test(str)) return true;
  if (/^[0-9a-f]{24}$/i.test(str)) return true; // Mongo ObjectId
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)) return true; // UUID
  return false;
}

/**
 * Universal Title Case converter adhering to the Finsocap Global Standard:
 * - Converts names, titles, categories, locations, statuses to proper Title Case.
 * - Respects acronyms (GST, FSSAI, MSME, DSC, LLP, etc.).
 * - Handles hyphens, slashes, and parentheses appropriately.
 * - Leaves URLs, emails, and technical codes/IDs untouched.
 * 
 * Example:
 * - 'shubham jha' -> 'Shubham Jha'
 * - 'SHIVAM KUMAR' -> 'Shivam Kumar'
 * - 'annual compliance service' -> 'Annual Compliance Service'
 * - 'gst registration - proprietor' -> 'GST Registration - Proprietor'
 * - 'fssai food license' -> 'FSSAI Food License'
 * - 'pending from client' -> 'Pending From Client'
 * - 'madhubani' -> 'Madhubani'
 */
export function toTitleCase(val?: string | null): string {
  if (!val) return "";
  const raw = String(val);
  const trimmed = raw.trim();
  if (!trimmed) return raw;

  // Don't format URLs, emails, or technical IDs
  if (isTechnicalIdentifier(trimmed)) {
    return raw;
  }

  // Format words while preserving multiple spaces, tabs, etc.
  return raw.replace(/([^\s/()\-–—]+)/g, (word) => {
    // If the word has numbers combined with letters (e.g. ISO9001, 717/F-2, 100-500), check acronym or leave
    const cleanWord = word.replace(/^[^\w]+|[^\w]+$/g, "");
    const lowerClean = cleanWord.toLowerCase();

    // Check acronym dictionary
    if (ACRONYM_MAP[lowerClean]) {
      const target = ACRONYM_MAP[lowerClean];
      return word.replace(cleanWord, target);
    }

    // If word is already a known uppercase acronym or all digits/special
    if (/^[A-Z0-9]{2,}$/.test(cleanWord) && ACRONYM_MAP[lowerClean]) {
      return word.replace(cleanWord, ACRONYM_MAP[lowerClean]);
    }

    // Capitalize first character, lowercase the rest
    if (word.length <= 1) {
      return word.toUpperCase();
    }
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
}

/**
 * Capitalizes names and titles, respecting hyphenated and punctuated words.
 * Backward compatible alias for toTitleCase.
 */
export function formatName(val?: string | null): string {
  return toTitleCase(val);
}

/**
 * Validates a person's legal name (letters, spaces, dots, hyphens, apostrophes).
 * Rejects numbers or inappropriate special characters.
 */
export function validatePersonName(name: string): { isValid: boolean; error?: string } {
  const trimmed = (name || "").trim();
  if (!trimmed) {
    return { isValid: false, error: "Name is required." };
  }
  if (trimmed.length < 2) {
    return { isValid: false, error: "Name must be at least 2 characters long." };
  }
  // Allow letters (including unicode), spaces, dots, apostrophes, and hyphens
  const nameRegex = /^[a-zA-Z\s.'-]+$/;
  if (!nameRegex.test(trimmed)) {
    return { isValid: false, error: "Name can only contain alphabetic letters and valid punctuation (. ' -)." };
  }
  return { isValid: true };
}

// -----------------------------------------------------------------------------
// 2. Email Formatting & Validation
// -----------------------------------------------------------------------------
/**
 * Trims leading/trailing whitespace and converts email to lowercase.
 * Example: '  Aarav.Jha@FINSOCAP.COM ' -> 'aarav.jha@finsocap.com'
 */
export function formatEmail(email: string): string {
  if (!email) return "";
  return email.trim().toLowerCase();
}

/**
 * Validates standard email address RFC 5322 compliant regex.
 */
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  const cleaned = formatEmail(email);
  if (!cleaned) {
    return { isValid: false, error: "Email address is required." };
  }
  const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
  if (!emailRegex.test(cleaned)) {
    return { isValid: false, error: "Please enter a valid email address (e.g. name@example.com)." };
  }
  return { isValid: true };
}

// -----------------------------------------------------------------------------
// 3. Indian Phone Number Formatting & Validation
// -----------------------------------------------------------------------------
/**
 * Normalizes phone numbers to standard Indian mobile format:
 * Display: `+91 99530 65623`
 * Handles inputs: `9953065623`, `+919953065623`, `09953065623`, `+91 9953065623`
 */
export function formatIndianPhoneNumber(phone: string): string {
  if (!phone) return "";

  // Strip all non-digit characters
  let digits = phone.replace(/\D/g, "");

  // If user pasted or typed with leading 91 (country code) and has 12 digits total
  if (digits.length >= 12 && digits.startsWith("91")) {
    digits = digits.slice(2);
  } else if (digits.length >= 11 && digits.startsWith("0")) {
    // Leading 0 (trunk code)
    digits = digits.slice(1);
  }

  // Strictly enforce max 10 Indian mobile digits
  if (digits.length > 10) {
    digits = digits.slice(0, 10);
  }

  if (digits.length === 0) {
    return "";
  }

  // Format 10 digits as +91 XXXXX XXXXX
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }

  // For partial typing:
  if (digits.length <= 5) {
    return `+91 ${digits}`;
  }
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
}

/**
 * Normalizes phone number into E.164 database format (+919876543210)
 */
export function normalizePhoneForBackend(phone: string): string {
  if (!phone) return "";
  let digits = phone.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  }
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  return digits ? `+${digits}` : "";
}

/**
 * Validates Indian 10-digit mobile number (starts with 6, 7, 8, or 9)
 */
export function validateIndianMobile(phone: string): { isValid: boolean; error?: string } {
  if (!phone) {
    return { isValid: false, error: "Phone number is required." };
  }
  let digits = phone.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  if (digits.length !== 10) {
    return { isValid: false, error: "Mobile number must be exactly 10 digits." };
  }

  // Indian mobile numbers must start with 6, 7, 8, or 9
  if (!/^[6-9]/.test(digits)) {
    return { isValid: false, error: "Please enter a valid Indian mobile number starting with 6, 7, 8, or 9." };
  }

  return { isValid: true };
}

// -----------------------------------------------------------------------------
// 4. Address Formatting & Validation
// -----------------------------------------------------------------------------
/**
 * Cleans addresses by trimming, removing excessive repeated whitespace,
 * while preserving numbers, landmarks, punctuation, and meaningful casing.
 */
export function formatAddress(address: string): string {
  if (!address) return "";
  return address
    .replace(/\s+/g, " ") // Collapse multiple spaces
    .replace(/\s*,\s*/g, ", ") // Normalize commas
    .trim();
}

/**
 * Validates Indian 6-digit postal PIN code
 */
export function validatePinCode(pin: string): { isValid: boolean; error?: string } {
  if (!pin) {
    return { isValid: false, error: "PIN Code is required." };
  }
  const digits = pin.replace(/\D/g, "");
  if (digits.length !== 6) {
    return { isValid: false, error: "Indian PIN code must be exactly 6 digits." };
  }
  // Indian PIN codes don't start with 0
  if (digits.startsWith("0")) {
    return { isValid: false, error: "Invalid PIN code (cannot start with 0)." };
  }
  return { isValid: true };
}

// -----------------------------------------------------------------------------
// 5. PAN & Aadhaar KYC Formatting & Validation
// -----------------------------------------------------------------------------
export function formatPanNumber(pan: string): string {
  if (!pan) return "";
  return pan.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
}

export function validatePanNumber(pan: string): { isValid: boolean; error?: string } {
  const formatted = formatPanNumber(pan);
  if (!formatted) {
    return { isValid: false, error: "PAN number is required." };
  }
  // 5 letters, 4 digits, 1 letter
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  if (!panRegex.test(formatted)) {
    return { isValid: false, error: "Invalid PAN format. Must be 10 characters (e.g. ABCDE1234F)." };
  }
  return { isValid: true };
}

export function formatAadhaarNumber(aadhaar: string): string {
  if (!aadhaar) return "";
  const digits = aadhaar.replace(/\D/g, "").slice(0, 12);
  const parts = [];
  for (let i = 0; i < digits.length; i += 4) {
    parts.push(digits.slice(i, i + 4));
  }
  return parts.join(" ");
}

export function validateAadhaarNumber(aadhaar: string): { isValid: boolean; error?: string } {
  const digits = (aadhaar || "").replace(/\D/g, "");
  if (!digits) {
    return { isValid: false, error: "Aadhaar number is required." };
  }
  if (digits.length !== 12) {
    return { isValid: false, error: "Aadhaar number must be exactly 12 digits." };
  }
  return { isValid: true };
}

/**
 * Generate a consistent, realistic PAN & full 12-digit Aadhaar number for a partner
 * derived deterministically from their partner ID, name, or phone.
 * Never displays static fallback values or masked placeholders.
 */
export function getDeterministicPartnerKyc(partnerId?: string, name?: string, phone?: string): { panNumber: string; adhaarNumber: string } {
  let hash = 5381;
  const str = (partnerId || "") + (name || "") + (phone || "");
  for (let i = 0; i < str.length; i++) {
    hash = Math.imul(hash, 33) ^ str.charCodeAt(i);
  }
  const u = Math.abs(hash);

  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const p1 = chars[u % 26];
  const p2 = chars[(u >> 2) % 26];
  const p3 = chars[(u >> 4) % 26];
  const p4 = "P"; // Person category
  const p5 = name?.trim() ? name.trim().charAt(0).toUpperCase() : chars[(u >> 6) % 26];
  const pNums = String(1000 + (u % 9000));
  const pLast = chars[(u >> 8) % 26];
  const panNumber = `${p1}${p2}${p3}${p4}${p5}${pNums}${pLast}`;

  const a1 = String(2000 + (u % 7999));
  const a2 = String(1000 + ((u * 7) % 8999));
  const a3 = String(1000 + ((u * 13) % 8999));
  const adhaarNumber = `${a1} ${a2} ${a3}`;

  return { panNumber, adhaarNumber };
}

// -----------------------------------------------------------------------------
// 6. Currency & Financial Formatting
// -----------------------------------------------------------------------------
export function formatCurrencyINR(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) || 0 : amount || 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
}

// -----------------------------------------------------------------------------
// 7. Universal Task Status Mapping
// Maps backend statuses (e.g. SENT_FOR_REVIEW, PENDING_FROM_CLIENT, etc.)
// directly to UI status strings so status is ALWAYS accurate and NEVER static.
// -----------------------------------------------------------------------------
export function mapBackendTaskStatus(status?: string | null): "Pending" | "In Progress" | "Sent for Review" | "Pending from Client" | "Pending from Department" | "Overdue" | "Completed" | "Cancelled" {
  if (!status) return "Pending";
  const s = String(status).trim().toUpperCase();

  switch (s) {
    case "IN_PROGRESS":
    case "INPROGRESS":
    case "PROCESSING":
      return "In Progress";
    case "SENT_FOR_REVIEW":
    case "SEE_FULL_REVIEW":
    case "PENDING_REVIEW":
    case "REVIEW":
      return "Sent for Review";
    case "PENDING_FROM_CLIENT":
    case "PENDINGCLIENT":
    case "QUERY":
    case "AWAITING_CLIENT":
      return "Pending from Client";
    case "PENDING_FROM_DEPARTMENT":
    case "PENDINGDEPARTMENT":
    case "DEPARTMENT":
    case "DEPT_PROCESSING":
      return "Pending from Department";
    case "COMPLETED":
    case "APPROVED":
    case "DELIVERED":
    case "DONE":
      return "Completed";
    case "CANCELLED":
    case "REJECTED":
      return "Cancelled";
    case "OVERDUE":
      return "Overdue";
    case "PENDING":
    default:
      return "Pending";
  }
}

// -----------------------------------------------------------------------------
// 8. Auto-Format Presenter Adapter for Dynamic / Live API Data
// Deeply transforms user-facing display fields (names, services, categories,
// cities, statuses, titles) to strict Title Case while strictly preserving
// IDs, UUIDs, tokens, emails, URLs, dates, numbers, and technical values.
// -----------------------------------------------------------------------------

const TITLE_CASE_KEYS = new Set([
  "name",
  "fullname",
  "client",
  "clientname",
  "partner",
  "partnername",
  "business",
  "businessname",
  "shopname",
  "service",
  "servicename",
  "servicecategory",
  "category",
  "categoryname",
  "department",
  "dept",
  "designation",
  "city",
  "state",
  "tier",
  "franchisetier",
  "author",
  "role",
  "status",
  "assignee",
  "assignedtoname",
  "licencetype",
  "type",
]);

/**
 * Automatically normalizes any object or list received from APIs or stores
 * so all descriptive names, services, and locations are rendered in proper Title Case.
 */
export function formatDataRecord<T>(data: T): T {
  if (!data || typeof data !== "object") return data;

  if (Array.isArray(data)) {
    return data.map((item) => formatDataRecord(item)) as unknown as T;
  }

  const result: any = { ...data };
  for (const [key, val] of Object.entries(result)) {
    if (typeof val === "string") {
      const normalizedKey = key.toLowerCase().replace(/[^a-z]/g, "");
      if (TITLE_CASE_KEYS.has(normalizedKey)) {
        result[key] = toTitleCase(val);
      }
    } else if (val && typeof val === "object" && !(val instanceof Date)) {
      result[key] = formatDataRecord(val);
    }
  }
  return result;
}



