import type { ListConversationsParams } from "@/lib/api/conversations";

/** Centralised, typed TanStack Query keys. */
export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  conversations: {
    all: ["conversations"] as const,
    /**
     * Prefix shared by every paginated/searched list page. Use this (not
     * `all`) whenever reading/patching cached `ConversationListResponse`s:
     * `all` also prefix-matches the `messages(id)` caches, whose data is a
     * `ChatMessage[]` — patching those as if they had `.conversations` crashes.
     */
    lists: ["conversations", "list"] as const,
    list: (params: ListConversationsParams) =>
      ["conversations", "list", params] as const,
    messages: (id: string) => ["conversations", id, "messages"] as const,
  },
} as const;
