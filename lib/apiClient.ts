/**
 * FinSoCap API Client SDK
 * Connects Frontend Web Dashboard to the Standalone Backend REST API
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://finsocap-api.onrender.com/api");

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string; error?: string }> {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("finsocap_auth_token") : null;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

    const res = await fetch(url, {
      ...options,
      headers,
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        success: false,
        message: json.message || `Request failed with status ${res.status}`,
        error: json.error,
      };
    }

    return json;
  } catch (err: any) {
    console.warn(`[FinSoCap API] Offline/Fallback mode for ${endpoint}:`, err.message);
    return {
      success: false,
      message: err.message || "Failed to connect to backend API server",
    };
  }
}

// Helper methods
export const api = {
  get: <T = any>(endpoint: string) => apiRequest<T>(endpoint, { method: "GET" }),
  post: <T = any>(endpoint: string, body: any) => apiRequest<T>(endpoint, { method: "POST", body: JSON.stringify(body) }),
  put: <T = any>(endpoint: string, body: any) => apiRequest<T>(endpoint, { method: "PUT", body: JSON.stringify(body) }),
  patch: <T = any>(endpoint: string, body?: any) => apiRequest<T>(endpoint, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  delete: <T = any>(endpoint: string) => apiRequest<T>(endpoint, { method: "DELETE" }),
};
