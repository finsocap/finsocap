/**
 * Module 8: Message Center & Support
 * REST API Specification Pages 18-19
 */

import { apiClient } from "./apiClient";
import {
  ApiResponse,
  ConversationItem,
  ChatMessageItem,
  CreateConversationPayload,
} from "@/types/api";

export const messageService = {
  /**
   * GET /api/admin/messages/conversations
   * Left sidebar thread list with unread badge counters, last messages, and participant metadata.
   */
  getConversations: async (): Promise<ApiResponse<ConversationItem[]>> => {
    return apiClient.get<ApiResponse<ConversationItem[]>>("/messages/conversations");
  },

  /**
   * POST /api/admin/messages/conversations
   * Initiates a new direct or group chat conversation thread.
   */
  createConversation: async (payload: CreateConversationPayload): Promise<ApiResponse<ConversationItem>> => {
    return apiClient.post<ApiResponse<ConversationItem>>("/messages/conversations", payload);
  },

  /**
   * GET /api/admin/messages/conversations/{id}
   * Retrieves chronological message history for the active conversation thread.
   */
  getMessages: async (conversationId: number | string): Promise<ApiResponse<ChatMessageItem[]>> => {
    return apiClient.get<ApiResponse<ChatMessageItem[]>>(`/messages/conversations/${conversationId}`);
  },

  /**
   * POST /api/admin/messages/conversations/{id}/send
   * Sends message from admin with optional Cloudinary compressed attachment.
   */
  sendMessage: async (
    conversationId: number | string,
    messageText: string,
    attachment?: File
  ): Promise<ApiResponse<ChatMessageItem>> => {
    const formData = new FormData();
    formData.append("messageText", messageText);
    if (attachment) {
      formData.append("attachment", attachment);
    }
    return apiClient.post<ApiResponse<ChatMessageItem>>(`/messages/conversations/${conversationId}/send`, formData);
  },

  /**
   * PUT /api/admin/messages/conversations/{id}/read
   * Clears unread message counter badge when admin opens conversation.
   */
  markAsRead: async (conversationId: number | string): Promise<ApiResponse<null>> => {
    return apiClient.put<ApiResponse<null>>(`/messages/conversations/${conversationId}/read`);
  },
};

