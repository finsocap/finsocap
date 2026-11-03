/**
 * Module 0: Authentication & Admin Session
 * REST API Specification Page 2
 */

import { apiClient, setAuthToken, clearAuthToken } from "./apiClient";
import { ApiResponse, LoginRequest, LoginResponseData } from "@/types/api";

export const authService = {
  /**
   * POST /api/admin/login
   * Authenticates Universal Admin and generates 24-hour stateless JWT Bearer token.
   */
  login: async (credentials: LoginRequest): Promise<ApiResponse<LoginResponseData>> => {
    try {
      const res = await apiClient.post<ApiResponse<LoginResponseData>>("/login", credentials);
      if (res.success && res.data?.token) {
        setAuthToken(res.data.token);
        if (typeof window !== "undefined") {
          const session = {
            token: res.data.token,
            user: {
              id: res.data.id,
              name: res.data.name || "Universal Admin",
              email: res.data.email,
              role: res.data.role || "ADMIN",
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
      // If /admin/login rejected because user is a Staff member, fallback to /staff/login
      if (
        err?.message?.includes("not an Administrator") ||
        err?.data?.message?.includes("not an Administrator") ||
        err?.status === 403
      ) {
        try {
          const staffRes = await apiClient.post<ApiResponse<any>>("/staff/login", credentials);
          if (staffRes.success && staffRes.data?.token) {
            setAuthToken(staffRes.data.token);
            if (typeof window !== "undefined") {
              localStorage.setItem("finsocap_staff_token", staffRes.data.token);
              const session = {
                token: staffRes.data.token,
                user: {
                  id: staffRes.data.id || staffRes.data.userId || 0,
                  name: staffRes.data.name || staffRes.data.fullName || "Staff Specialist",
                  email: staffRes.data.email || credentials.email,
                  role: "STAFF",
                  status: "ACTIVE",
                },
                expires: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
              };
              localStorage.setItem("finsocap_user_session", JSON.stringify(session));
            }
            return staffRes as any;
          }
        } catch (staffErr) {
          // If staff login also fails, throw original or staff error
          throw staffErr;
        }
      }
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

