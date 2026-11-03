/**
 * Finsocap Global Input Formatting & Validation Utilities
 *
 * Provides standardized, non-destructive formatting and validation across
 * all user roles: Admin, Specialist / Employee, Partner, and Clients.
 */

// -----------------------------------------------------------------------------
// 1. Name Formatting
// -----------------------------------------------------------------------------
/**
 * Capitalizes the first letter of each word in a person/business name,
 * preserving letters after apostrophes/hyphens and respecting initials.
 * Example: 'aarav jha' -> 'Aarav Jha', 'RAHUL KUMAR' -> 'Rahul Kumar'
 */
export function formatName(val: string): string {
  if (!val) return "";
  // Do not format if empty or only spaces
  const trimmed = val.trim();
  if (!trimmed) return "";

  // Split words by space while preserving structure
  return val
    .split(" ")
    .map((word) => {
      if (!word) return "";
      // Handle hyphenated names like "Mary-Jane"
      if (word.includes("-")) {
        return word
          .split("-")
          .map((sub) => (sub ? sub.charAt(0).toUpperCase() + sub.slice(1).toLowerCase() : ""))
          .join("-");
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
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

  // Strip all non-digit characters except a leading '+'
  let digits = phone.replace(/\D/g, "");

  // If starts with 91 and has 12 digits, strip country code to get 10 digits
  if (digits.length === 12 && digits.startsWith("91")) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith("0")) {
    // Leading 0 (trunk code)
    digits = digits.slice(1);
  }

  // Format 10 digits as +91 XXXXX XXXXX
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }

  // For partial typing:
  if (digits.length > 0 && digits.length <= 5) {
    return `+91 ${digits}`;
  }
  if (digits.length > 5 && digits.length < 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }

  // If longer than 10 digits and not 12, return with +91 if not present
  if (digits.length > 10) {
    const mainDigits = digits.slice(-10);
    return `+91 ${mainDigits.slice(0, 5)} ${mainDigits.slice(5)}`;
  }

  return phone.trim();
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

