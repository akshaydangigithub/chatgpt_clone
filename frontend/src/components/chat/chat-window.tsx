"use client";

import { useEffect, useRef } from "react";

import { ChatHeader } from "@/components/chat/chat-header";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessages } from "@/components/chat/chat-messages";
import { Loader } from "@/components/common/loader";
import { conversationTitle } from "@/lib/format";
import { useChat } from "@/lib/hooks/use-chat";
import { useCachedConversation } from "@/lib/hooks/use-conversations";
import { usePendingStore } from "@/lib/store/pending-store";

export function ChatWindow({ conversationId }: { conversationId: string }) {
  const { messages, isStreaming, isLoadingHistory, send, stop, regenerate } =
    useChat(conversationId);

  const consumePending = usePendingStore((s) => s.consumePending);
  const cached = useCachedConversation(conversationId);
  const startedRef = useRef(false);

  // Pick up the first message forwarded from the "new chat" screen and stream
  // it exactly once for this conversation.
  useEffect(() => {
    if (startedRef.current) return;
    const pending = consumePending(conversationId);
    if (pending) {
      startedRef.current = true;
      void send(pending);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  const title = cached ? conversationTitle(cached) : "New chat";
  const showLoader = isLoadingHistory && messages.length === 0;

  return (
    <div className="flex h-full min-w-0 flex-col">
      <ChatHeader title={title} />

      {showLoader ? (
        <div className="flex-1">
          <Loader fullscreen label="Loading conversation" />
        </div>
      ) : (
        <ChatMessages
          messages={messages}
          isStreaming={isStreaming}
          onRegenerate={regenerate}
        />
      )}

      <ChatInput
        onSend={send}
        onStop={stop}
        isStreaming={isStreaming}
        autoFocus
      />
    </div>
  );
}
