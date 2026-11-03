/**
 * Module 7: Reports & Compliance Intelligence (Licences Vault & Audit Exports)
 * REST API Specification Pages 14-17
 */

import { apiClient } from "./apiClient";
import {
  ApiResponse,
  SpecialistReport,
  PartnerReport,
  LicenceReportMetrics,
  LicenceRegistryRow,
  RegisterLicencePayload,
  RevealPasswordResponse,
} from "@/types/api";

export const reportsService = {
  /**
   * GET /api/admin/reports/service-team
   * Analytics on internal specialist productivity: closed cases, turnaround SLA, and fees billed.
   */
  getServiceTeamReport: async (): Promise<ApiResponse<SpecialistReport>> => {
    return apiClient.get<ApiResponse<SpecialistReport>>("/reports/service-team");
  },

  /**
   * GET /api/admin/reports/service-team/export
   * Downloads Service Team Performance report as a standard CSV spreadsheet file.
   */
  exportServiceTeamReportCsv: async (): Promise<string> => {
    return apiClient.get<string>("/reports/service-team/export");
  },

  /**
   * GET /api/admin/reports/franchise-partners
   * Branch performance metrics: gross client collections, completion rates, and paid partner commissions.
   */
  getPartnerReport: async (): Promise<ApiResponse<PartnerReport>> => {
    return apiClient.get<ApiResponse<PartnerReport>>("/reports/franchise-partners");
  },

  /**
   * GET /api/admin/reports/franchise-partners/export
   * Downloads Franchise Partner report as a CSV file.
   */
  exportPartnerReportCsv: async (): Promise<string> => {
    return apiClient.get<string>("/reports/franchise-partners/export");
  },

  /**
   * GET /api/admin/reports/licences
   * Central compliance registry of government portal credentials and licences.
   */
  getLicences: async (): Promise<ApiResponse<LicenceReportMetrics>> => {
    return apiClient.get<ApiResponse<LicenceReportMetrics>>("/reports/licences");
  },

  /**
   * POST /api/admin/reports/licences
   * Registers an issued government licence and credentials.
   */
  registerLicence: async (payload: RegisterLicencePayload): Promise<ApiResponse<LicenceRegistryRow>> => {
    return apiClient.post<ApiResponse<LicenceRegistryRow>>("/reports/licences", payload);
  },

  /**
   * GET /api/admin/reports/licences/{id}/reveal-password
   * Audited security endpoint: Decrypts and reveals the plaintext government portal password.
   */
  revealLicencePassword: async (id: number | string): Promise<ApiResponse<RevealPasswordResponse>> => {
    return apiClient.get<ApiResponse<RevealPasswordResponse>>(`/reports/licences/${id}/reveal-password`);
  },

  /**
   * GET /api/admin/reports/licences/export
   * Exports government licences registry as a downloadable CSV spreadsheet.
   */
  exportLicencesCsv: async (): Promise<string> => {
    return apiClient.get<string>("/reports/licences/export");
  },

  /**
   * POST /api/admin/reports/licences/{id}/upload-certificate
   * Uploads issued government certificate PDF/Image to Cloudinary and links to licence record.
   */
  uploadCertificate: async (
    id: number | string,
    file: File
  ): Promise<ApiResponse<{ certificateUrl: string }>> => {
    const formData = new FormData();
    formData.append("certificateFile", file);
    return apiClient.post<ApiResponse<{ certificateUrl: string }>>(
      `/reports/licences/${id}/upload-certificate`,
      formData
    );
  },
};

