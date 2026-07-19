"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/client";
import { conversationsApi } from "@/lib/api/conversations";
import { CONVERSATIONS_PAGE_SIZE, ROUTES } from "@/lib/constants";
import { queryKeys } from "@/lib/query/keys";
import { useAuthStore } from "@/lib/store/auth-store";
import type { Conversation, ConversationListResponse } from "@/types/api";

/** Paginated / searchable conversation list for the sidebar. */
export function useConversations(search: string, page = 1) {
  const token = useAuthStore((s) => s.token);
  const params = { page, pageSize: CONVERSATIONS_PAGE_SIZE, search };

  return useQuery({
    queryKey: queryKeys.conversations.list(params),
    queryFn: () => conversationsApi.list(params),
    enabled: Boolean(token),
    placeholderData: (prev) => prev, // keep previous page while searching
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => conversationsApi.create(),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.all,
      });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useRenameConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      conversationsApi.rename(id, title),
    // Optimistically patch every cached list page.
    onMutate: async ({ id, title }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.conversations.all,
      });
      const snapshots = queryClient.getQueriesData<ConversationListResponse>({
        queryKey: queryKeys.conversations.all,
      });
      for (const [key, data] of snapshots) {
        if (!data) continue;
        queryClient.setQueryData<ConversationListResponse>(key, {
          ...data,
          conversations: data.conversations.map((c) =>
            c.id === id ? { ...c, title } : c,
          ),
        });
      }
      return { snapshots };
    },
    onError: (error, _vars, context) => {
      context?.snapshots.forEach(([key, data]) =>
        queryClient.setQueryData(key, data),
      );
      toast.error(getErrorMessage(error));
    },
    onSuccess: () => toast.success("Conversation renamed"),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.all,
      }),
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (id: string) => conversationsApi.remove(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.conversations.all,
      });
      const snapshots = queryClient.getQueriesData<ConversationListResponse>({
        queryKey: queryKeys.conversations.all,
      });
      for (const [key, data] of snapshots) {
        if (!data) continue;
        queryClient.setQueryData<ConversationListResponse>(key, {
          ...data,
          conversations: data.conversations.filter((c) => c.id !== id),
          total: Math.max(0, data.total - 1),
        });
      }
      return { snapshots };
    },
    onError: (error, _id, context) => {
      context?.snapshots.forEach(([key, data]) =>
        queryClient.setQueryData(key, data),
      );
      toast.error(getErrorMessage(error));
    },
    onSuccess: (_data, id) => {
      toast.success("Conversation deleted");
      // If we're viewing the deleted conversation, go home.
      if (window.location.pathname === ROUTES.conversation(id)) {
        router.replace(ROUTES.home);
      }
    },
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.all,
      }),
  });
}

/** Look up a single conversation from any cached list page (no extra request). */
export function useCachedConversation(id: string | undefined): Conversation | undefined {
  const queryClient = useQueryClient();
  if (!id) return undefined;
  const lists = queryClient.getQueriesData<ConversationListResponse>({
    queryKey: queryKeys.conversations.all,
  });
  for (const [, data] of lists) {
    const found = data?.conversations.find((c) => c.id === id);
    if (found) return found;
  }
  return undefined;
}
