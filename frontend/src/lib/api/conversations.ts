import { apiClient } from "./client";
import type {
  Conversation,
  ConversationListResponse,
  MessageListResponse,
} from "@/types/api";

export interface ListConversationsParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export const conversationsApi = {
  async list(
    params: ListConversationsParams = {},
  ): Promise<ConversationListResponse> {
    const { data } = await apiClient.get<ConversationListResponse>(
      "/conversations/",
      {
        params: {
          page: params.page ?? 1,
          page_size: params.pageSize ?? 20,
          search_query: params.search || undefined,
        },
      },
    );
    return data;
  },

  async create(): Promise<Conversation> {
    const { data } = await apiClient.post<Conversation>("/conversations/");
    return data;
  },

  async rename(id: string, title: string): Promise<Conversation> {
    const { data } = await apiClient.patch<Conversation>(
      `/conversations/${id}`,
      { title },
    );
    return data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/conversations/${id}`);
  },

  async messages(id: string): Promise<MessageListResponse> {
    const { data } = await apiClient.get<MessageListResponse>(
      `/conversations/${id}/messages`,
    );
    return data;
  },
};
