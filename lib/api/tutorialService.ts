/**
 * Partner Learning Centre & Tutorial Management Service
 * Endpoints:
 * - GET /api/tutorials?page={page}&size={size}
 * - GET /api/tutorials/{id}
 * - GET /api/tutorials/{id}/pdf
 * - POST /api/admin/tutorials
 * - PATCH /api/admin/tutorials/{id}
 * - DELETE /api/admin/tutorials/{id}
 */

import { apiClient } from "./apiClient";

export interface TutorialItem {
  id: number;
  title: string;
  fileName: string;
  sizeBytes: number;
  downloadUrl: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface PaginatedTutorials {
  items: TutorialItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface TutorialApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const tutorialService = {
  /**
   * GET /api/tutorials?page={page}&size={size}
   * Fetches paginated tutorials/SOP materials
   */
  getTutorials: async (page: number = 0, size: number = 10): Promise<TutorialApiResponse<PaginatedTutorials>> => {
    return apiClient.get<TutorialApiResponse<PaginatedTutorials>>("/tutorials", {
      page,
      size,
    });
  },

  /**
   * GET /api/tutorials/{id}
   * Fetches single tutorial details
   */
  getTutorialById: async (id: number): Promise<TutorialApiResponse<TutorialItem>> => {
    return apiClient.get<TutorialApiResponse<TutorialItem>>(`/tutorials/${id}`);
  },

  /**
   * Protected download of the tutorial PDF
   * GET /api/tutorials/{id}/pdf
   */
  downloadPdf: async (id: number, fileName?: string): Promise<void> => {
    const { blob, objectUrl } = await apiClient.fetchBlob(`/tutorials/${id}/pdf`, false);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = fileName || `tutorial-${id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => {
      window.URL.revokeObjectURL(objectUrl);
    }, 10000);
  },

  /**
   * Fetch PDF blob as Object URL for inline viewer
   */
  getPdfObjectUrl: async (id: number): Promise<string> => {
    const { objectUrl } = await apiClient.fetchBlob(`/tutorials/${id}/pdf`, true);
    return objectUrl;
  },

  /**
   * POST /api/admin/tutorials
   * Upload new tutorial PDF (multipart/form-data: title, file)
   */
  createTutorial: async (title: string, file: File): Promise<TutorialApiResponse<TutorialItem>> => {
    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("file", file);

    return apiClient.post<TutorialApiResponse<TutorialItem>>("/admin/tutorials", formData);
  },

  /**
   * PATCH /api/admin/tutorials/{id}
   * Update title or replace PDF file
   */
  updateTutorial: async (id: number, title?: string, file?: File): Promise<TutorialApiResponse<TutorialItem>> => {
    const formData = new FormData();
    if (title !== undefined && title.trim().length > 0) {
      formData.append("title", title.trim());
    }
    if (file) {
      formData.append("file", file);
    }

    return apiClient.patch<TutorialApiResponse<TutorialItem>>(`/admin/tutorials/${id}`, formData);
  },

  /**
   * DELETE /api/admin/tutorials/{id}
   * Delete tutorial
   */
  deleteTutorial: async (id: number): Promise<TutorialApiResponse<null>> => {
    return apiClient.delete<TutorialApiResponse<null>>(`/admin/tutorials/${id}`);
  },
};

