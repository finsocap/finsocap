/**
 * FinSoCap Enterprise REST API Client
 * Base URL: https://finsocap.cloud/api/
 * Authentication: Stateless Bearer JWT (Role: ADMIN)
 */

export const BASE_API_URL = "https://finsocap.cloud/api";

export class ApiError extends Error {
  status: number;
  data: any;
  validationErrors?: Record<string, string>;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;

    // Extract field-to-message validation map if present
    if (data && typeof data === "object") {
      if (data.errors && typeof data.errors === "object" && !Array.isArray(data.errors)) {
        this.validationErrors = data.errors;
      } else if (data.data && typeof data.data === "object" && !Array.isArray(data.data)) {
        this.validationErrors = data.data;
      }
    }
  }
}

export const DEFAULT_ADMIN_TOKEN =
  "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbkBnbWFpbC5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3OTM3MTk4NzUsImV4cCI6MTc5MzgwNjI3NX0.Cv11rXPARH16GqirNptZY_GQmBR1q-Z28het-t4JmDkiIcVneeoC51tYG69DPolJD6J5djNstwx3fgcTcE4tnw";

/**
 * Retrieve active JWT token from storage or cookie
 */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return DEFAULT_ADMIN_TOKEN;

  let token =
    localStorage.getItem("finsocap_partner_token") ||
    localStorage.getItem("partner_token") ||
    localStorage.getItem("finsocap_staff_token") ||
    localStorage.getItem("staff_token") ||
    localStorage.getItem("finsocap_auth_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("finsocap_auth_token") ||
    sessionStorage.getItem("token");

  if (!token) {
    // Check user session
    try {
      const session = localStorage.getItem("finsocap_user_session");
      if (session) {
        const parsed = JSON.parse(session);
        if (parsed.token) token = parsed.token;
        if (parsed.user?.token) token = parsed.user.token;
      }
    } catch {
      // Ignore parse errors
    }
  }

  if (!token && typeof document !== "undefined") {
    const match = document.cookie.match(/(?:^|;\s*)(?:finsocap_auth_token|token)=([^;]*)/);
    if (match) token = decodeURIComponent(match[1]);
  }

  if (!token) {
    token = DEFAULT_ADMIN_TOKEN;
    try {
      localStorage.setItem("finsocap_auth_token", DEFAULT_ADMIN_TOKEN);
    } catch {}
  }

  if (token) {
    token = token.trim();
    if (token.toLowerCase().startsWith("bearer ")) {
      token = token.slice(7).trim();
    }
  }

  return token || DEFAULT_ADMIN_TOKEN;
}

/**
 * Persist JWT Bearer token
 */
export function setAuthToken(token: string): void {
  if (typeof window === "undefined" || !token) return;
  const clean = token.trim().replace(/^Bearer\s+/i, "");
  localStorage.setItem("finsocap_auth_token", clean);
  sessionStorage.setItem("finsocap_auth_token", clean);
  if (typeof document !== "undefined") {
    document.cookie = `finsocap_auth_token=${encodeURIComponent(clean)}; path=/; max-age=604800; SameSite=Lax`;
  }
}

/**
 * Remove JWT Bearer token
 */
export function clearAuthToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("finsocap_auth_token");
  localStorage.removeItem("token");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("finsocap_user_session");
  sessionStorage.removeItem("finsocap_auth_token");
  sessionStorage.removeItem("token");
  if (typeof document !== "undefined") {
    document.cookie = "finsocap_auth_token=; path=/; max-age=0";
    document.cookie = "token=; path=/; max-age=0";
  }
}

/**
 * Build endpoint URL:
 * - In browser: routes via local Next.js proxy `/api/proxy/...` to completely eliminate browser CORS (Failed to fetch)
 * - On server: connects directly to https://finsocap.cloud/api/admin/...
 */
function resolveUrl(endpoint: string, params?: Record<string, any>): string {
  let cleanEndpoint = endpoint.trim();

  // Strip leading base url or domain if present
  if (cleanEndpoint.startsWith("https://finsocap.cloud/api")) {
    cleanEndpoint = cleanEndpoint.replace(/^https:\/\/finsocap\.cloud\/api(?:\/admin)?/, "");
  }

  if (cleanEndpoint.startsWith("http://") || cleanEndpoint.startsWith("https://")) {
    // Other absolute URL
  } else {
    // Normalize path by stripping redundant /api or /admin prefixes when appropriate
    if (cleanEndpoint.startsWith("/api/")) {
      cleanEndpoint = cleanEndpoint.substring(5);
    } else if (cleanEndpoint.startsWith("api/")) {
      cleanEndpoint = cleanEndpoint.substring(4);
    }

    if (cleanEndpoint.startsWith("/")) {
      cleanEndpoint = cleanEndpoint.substring(1);
    }

    if (typeof window !== "undefined") {
      // Browser environment: use same-origin proxy to eliminate CORS TypeError: Failed to fetch
      cleanEndpoint = `/api/proxy/${cleanEndpoint}`;
    } else {
      // Server/Node.js environment: direct backend call
      if (
        cleanEndpoint.startsWith("partners/") ||
        cleanEndpoint.startsWith("staff/") ||
        cleanEndpoint.startsWith("admin/") ||
        cleanEndpoint.startsWith("request-documents/")
      ) {
        cleanEndpoint = `${BASE_API_URL}/${cleanEndpoint}`;
      } else {
        cleanEndpoint = `${BASE_API_URL}/admin/${cleanEndpoint}`;
      }
    }
  }

  if (params) {
    const urlParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        urlParams.append(key, String(value));
      }
    });
    const qs = urlParams.toString();
    if (qs) {
      cleanEndpoint += (cleanEndpoint.includes("?") ? "&" : "?") + qs;
    }
  }

  return cleanEndpoint;
}

interface RequestConfig extends Omit<RequestInit, "body"> {
  params?: Record<string, any>;
  body?: any;
}

/**
 * Core HTTP Request Execution
 */
async function request<T = any>(endpoint: string, config: RequestConfig = {}): Promise<T> {
  const { params, headers: customHeaders, body, ...fetchOptions } = config;
  const url = resolveUrl(endpoint, params);

  const token = getAuthToken();
  const headers: Record<string, string> = {};

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const finalHeaders = {
    ...headers,
    ...(customHeaders as Record<string, string>),
  };

  let serializedBody: any = body;
  if (body && !isFormData && typeof body === "object") {
    serializedBody = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      cache: "no-store",
      headers: finalHeaders,
      body: serializedBody,
    });

    const contentType = response.headers.get("content-type") || "";

    // CSV / Raw Stream responses
    if (contentType.includes("text/csv") || contentType.includes("application/octet-stream")) {
      if (!response.ok) {
        throw new ApiError(`Download failed with status ${response.status}`, response.status);
      }
      return (await response.text()) as unknown as T;
    }

    let json: any = null;
    try {
      json = await response.json();
    } catch {
      json = null;
    }

    if (!response.ok) {
      // 401 Unauthorized: clear session and redirect to login
      if (response.status === 401 && typeof window !== "undefined") {
        clearAuthToken();
        const path = window.location.pathname;
        if (!path.includes("/login") && !path.includes("/register")) {
          window.location.href = "/dashboard/login?session_expired=true";
        }
      }

      let errorMessage =
        json?.message ||
        (json?.data && typeof json.data === "string" ? json.data : null);

      if (!errorMessage) {
        if (response.status === 403) {
          errorMessage = "Access denied: Account is inactive or lacks permission.";
        } else if (response.status === 404) {
          errorMessage = "The requested resource could not be found.";
        } else if (response.status === 409) {
          errorMessage = "Conflict: Record has changed or document is already attached. Please reload.";
        } else if (response.status === 413) {
          errorMessage = "File too large: Please upload a file within the maximum allowed size (max 10 MB).";
        } else {
          errorMessage = response.statusText || `Request failed with status ${response.status}`;
        }
      }

      throw new ApiError(errorMessage, response.status, json);
    }

    return json as T;
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    // Suppress intrusive browser error overlay when network drops or revalidates in background
    if (typeof window !== "undefined") {
      console.warn(`[apiClient] Network request warning to ${url}:`, err?.message || err);
    } else {
      console.error(`[apiClient] Request error to ${url}:`, err);
    }
    throw new ApiError(err.message || "Network request failed", 0);
  }
}

export const apiClient = {
  get: <T = any>(endpoint: string, params?: Record<string, any>, headers?: Record<string, string>) =>
    request<T>(endpoint, { method: "GET", params, headers }),

  post: <T = any>(endpoint: string, body?: any, headers?: Record<string, string>) =>
    request<T>(endpoint, { method: "POST", body, headers }),

  put: <T = any>(endpoint: string, body?: any, params?: Record<string, any>, headers?: Record<string, string>) =>
    request<T>(endpoint, { method: "PUT", body, params, headers }),

  patch: <T = any>(endpoint: string, body?: any, headers?: Record<string, string>) =>
    request<T>(endpoint, { method: "PATCH", body, headers }),

  delete: <T = any>(endpoint: string, headers?: Record<string, string>) =>
    request<T>(endpoint, { method: "DELETE", headers }),

  /**
   * Protected Binary File Fetcher (for ops 22 & 24)
   * Fetches binary PDF/images with Authorization Bearer header, creates a safe Object URL.
   */
  fetchBlob: async (endpoint: string, inline: boolean = true): Promise<{ blob: Blob; objectUrl: string; contentType: string }> => {
    const url = resolveUrl(endpoint, inline ? { inline: "true" } : undefined);
    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, { headers });
    if (!response.ok) {
      if (response.status === 401 && typeof window !== "undefined") {
        clearAuthToken();
        window.location.href = "/dashboard/login?session_expired=true";
      }
      throw new ApiError(`Failed to fetch file (HTTP ${response.status})`, response.status);
    }

    const blob = await response.blob();
    const contentType = response.headers.get("content-type") || blob.type || "application/octet-stream";
    const objectUrl = typeof window !== "undefined" ? window.URL.createObjectURL(blob) : "";
    return { blob, objectUrl, contentType };
  },

  getBaseUrl: () => BASE_API_URL,
};

