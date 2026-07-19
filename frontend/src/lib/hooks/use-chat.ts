"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useRef, useState } from "react";

import { streamChat } from "@/lib/api/stream";
import { queryKeys } from "@/lib/query/keys";
import { useConversationMessages } from "@/lib/hooks/use-messages";
import type { ChatMessage } from "@/types/chat";

/**
 * Generate a stable-ish client id for optimistic messages. We avoid
 * `crypto.randomUUID` collisions with server ids by prefixing.
 */
function draftId(role: string) {
  return `draft-${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export interface UseChatResult {
  /** Persisted messages + any in-flight optimistic ones, in order. */
  messages: ChatMessage[];
  isStreaming: boolean;
  isLoadingHistory: boolean;
  /** Send a message and stream the assistant reply. */
  send: (text: string) => Promise<void>;
  /** Abort the in-flight generation. */
  stop: () => void;
  /** Retry the last user message (after an error). */
  regenerate: () => Promise<void>;
}

/**
 * Owns the full chat lifecycle for one conversation: it merges persisted
 * history (TanStack Query) with optimistic drafts, drives the SSE stream, and
 * reconciles once generation completes.
 */
export function useChat(conversationId: string): UseChatResult {
  const queryClient = useQueryClient();
  const { data: history, isLoading: isLoadingHistory } =
    useConversationMessages(conversationId);

  const [drafts, setDrafts] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const lastUserMessage = useRef<string | null>(null);

  const messages = useMemo<ChatMessage[]>(
    () => [...(history ?? []), ...drafts],
    [history, drafts],
  );

  const patchDraft = useCallback(
    (id: string, patch: Partial<ChatMessage>) => {
      setDrafts((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...patch } : m)),
      );
    },
    [],
  );

  const runStream = useCallback(
    async (text: string) => {
      const now = new Date().toISOString();
      const userMsg: ChatMessage = {
        id: draftId("user"),
        conversation_id: conversationId,
        role: "user",
        content: text,
        created_at: now,
        pending: true,
      };
      const assistantId = draftId("assistant");
      const assistantMsg: ChatMessage = {
        id: assistantId,
        conversation_id: conversationId,
        role: "assistant",
        content: "",
        created_at: now,
        streaming: true,
        pending: true,
      };

      setDrafts((prev) => [...prev, userMsg, assistantMsg]);
      setIsStreaming(true);
      lastUserMessage.current = text;

      const controller = new AbortController();
      abortRef.current = controller;

      let received = "";

      await streamChat(
        { conversation_id: conversationId, message: text },
        {
          onChunk: (chunk) => {
            received += chunk;
            patchDraft(assistantId, { content: received });
          },
          onDone: async () => {
            patchDraft(assistantId, { streaming: false });
            setIsStreaming(false);
            abortRef.current = null;
            // Refetch the source of truth, then drop the optimistic drafts so
            // the persisted messages take over without a visible flicker.
            await queryClient.invalidateQueries({
              queryKey: queryKeys.conversations.messages(conversationId),
            });
            await queryClient.invalidateQueries({
              queryKey: queryKeys.conversations.all,
            });
            setDrafts([]);
          },
          onError: (message) => {
            patchDraft(assistantId, {
              streaming: false,
              error: true,
              content: received || `⚠️ ${message}`,
            });
            setIsStreaming(false);
            abortRef.current = null;
          },
        },
        controller.signal,
      );
    },
    [conversationId, patchDraft, queryClient],
  );

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;
      await runStream(trimmed);
    },
    [isStreaming, runStream],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
    setDrafts((prev) =>
      prev.map((m) => (m.streaming ? { ...m, streaming: false } : m)),
    );
  }, []);

  const regenerate = useCallback(async () => {
    if (isStreaming || !lastUserMessage.current) return;
    // Drop the failed exchange drafts before retrying.
    setDrafts([]);
    await runStream(lastUserMessage.current);
  }, [isStreaming, runStream]);

  return {
    messages,
    isStreaming,
    isLoadingHistory,
    send,
    stop,
    regenerate,
  };
}
