import type { ListConversationsParams } from "@/lib/api/conversations";

export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  conversations: {
    all: ["conversations"] as const,
    lists: ["conversations", "list"] as const,
    list: (params: ListConversationsParams) =>
      ["conversations", "list", params] as const,
    messages: (id: string) => ["conversations", id, "messages"] as const,
  },
} as const;
