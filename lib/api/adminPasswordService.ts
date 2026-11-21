/**
 * Admin Password Service
 * Integration with PATCH /api/admin/password
 */

import { apiClient } from "./apiClient";
import { ApiResponse } from "@/types/api";

export interface AdminPasswordResponse {
  success: boolean;
  message: string;
  data: null;
}

export const adminPasswordService = {
  /**
   * Updates admin password
   * Constraints:
   * - Minimum 12 characters
   * - Maximum 72 UTF-8 bytes
   * - Must contain no null characters
   */
  updatePassword: async (newPassword: string): Promise<ApiResponse<null>> => {
    return apiClient.patch<ApiResponse<null>>("/admin/password", {
      newPassword,
    });
  },
};
