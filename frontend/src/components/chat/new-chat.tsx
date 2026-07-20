"use client";

import { ChatHeader } from "@/components/chat/chat-header";
import { ChatEmpty } from "@/components/chat/chat-empty";
import { ChatInput } from "@/components/chat/chat-input";
import { useStartNewChat } from "@/lib/hooks/use-new-chat";

export function NewChat() {
  const { start, isCreating } = useStartNewChat();

  return (
    <div className="flex h-full min-w-0 flex-col">
      <ChatHeader title="New chat" />
      <div className="min-h-0 flex-1">
        <ChatEmpty onPick={start} />
      </div>
      <ChatInput
        onSend={start}
        disabled={isCreating}
        placeholder="Ask anything…"
        autoFocus
      />
    </div>
  );
}
