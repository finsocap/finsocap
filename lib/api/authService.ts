/**
 * Module 0: Authentication & Admin Session
 * REST API Specification Page 2
 */

import { apiClient, setAuthToken, clearAuthToken } from "./apiClient";
import { ApiResponse, LoginRequest, LoginResponseData } from "@/types/api";

export const authService = {
  /**
   * POST /api/auth/login (Secure Server-Side Route)
   * Authenticates user securely without exposing any plain-text secrets in the client bundle.
   */
  login: async (credentials: LoginRequest): Promise<ApiResponse<LoginResponseData>> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const res: ApiResponse<LoginResponseData> = await response.json();

      if (res.success && res.data?.token) {
        setAuthToken(res.data.token);
        if (typeof window !== "undefined") {
          const session = {
            token: res.data.token,
            user: {
              id: res.data.id,
              name: res.data.name || "Administrator",
              email: res.data.email,
              role: (res.data.role || "ADMIN").toUpperCase(),
              status: res.data.status || "ACTIVE",
            },
            expires: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
          };
          localStorage.setItem("finsocap_user_session", JSON.stringify(session));
        }
        return res;
      }
      return res;
    } catch (err: any) {
      console.error("[authService.login] Error:", err);
      throw err;
    }
  },

  /**
   * Logout Admin: Clears JWT Bearer token and local session
   */
  logout: () => {
    clearAuthToken();
    if (typeof window !== "undefined") {
      localStorage.removeItem("finsocap_user_session");
    }
  },

  /**
   * Get Current Session Data
   */
  getSession: () => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem("finsocap_user_session");
      if (raw) return JSON.parse(raw);
    } catch {
      return null;
    }
    return null;
  },
};

