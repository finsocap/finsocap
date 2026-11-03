/**
 * Module 4: Clients CRM & Business Profiles
 * REST API Specification Pages 8-10
 */

import { apiClient } from "./apiClient";
import {
  ApiResponse,
  ClientMetrics,
  ClientProfile,
  ClientHistoryItem,
  CreateClientPayload,
} from "@/types/api";

export const clientCrmService = {
  /**
   * GET /api/admin/clients/metrics
   * Aggregates registered business entities by legal constitution structure.
   */
  getMetrics: async (): Promise<ApiResponse<ClientMetrics>> => {
    return apiClient.get<ApiResponse<ClientMetrics>>("/clients/metrics");
  },

  /**
   * GET /api/admin/clients
   * Full searchable CRM directory of business clients linked to submitting franchise partners.
   */
  getClients: async (params?: { search?: string; constitution?: string }): Promise<ApiResponse<ClientProfile[]>> => {
    return apiClient.get<ApiResponse<ClientProfile[]>>("/clients", params);
  },

  /**
   * GET /api/admin/clients/{id}/history
   * Retrieves complete chronological service engagement and subscription history for a client.
   */
  getClientHistory: async (id: number | string): Promise<ApiResponse<ClientHistoryItem[]>> => {
    return apiClient.get<ApiResponse<ClientHistoryItem[]>>(`/clients/${id}/history`);
  },

  /**
   * POST /api/admin/clients
   * Registers a direct client business entity.
   */
  createClient: async (payload: CreateClientPayload): Promise<ApiResponse<ClientProfile>> => {
    return apiClient.post<ApiResponse<ClientProfile>>("/clients", payload);
  },

  /**
   * PUT /api/admin/clients/{id}
   * Updates client contact details, legal business name, and constitution type.
   */
  updateClient: async (
    id: number | string,
    payload: Partial<CreateClientPayload>
  ): Promise<ApiResponse<ClientProfile>> => {
    return apiClient.put<ApiResponse<ClientProfile>>(`/clients/${id}`, payload);
  },
};
