"use client";

import { useQuery } from "@tanstack/react-query";

import { conversationsApi } from "@/lib/api/conversations";
import { queryKeys } from "@/lib/query/keys";
import { toChatRole, type ChatMessage } from "@/types/chat";

export function useConversationMessages(id: string | undefined) {
  return useQuery({
    queryKey: id ? queryKeys.conversations.messages(id) : ["messages", "none"],
    queryFn: async (): Promise<ChatMessage[]> => {
      const { messages } = await conversationsApi.messages(id!);
      return messages.map((m) => ({ ...m, role: toChatRole(m.role) }));
    },
    enabled: Boolean(id),
    staleTime: 15_000,
  });
}
