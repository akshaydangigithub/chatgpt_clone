"use client";

import { useParams } from "next/navigation";

import { ChatWindow } from "@/components/chat/chat-window";
import { Loader } from "@/components/common/loader";

export default function ConversationPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  if (!id) return <Loader fullscreen label="Loading" />;

  // Remount on id change so per-conversation chat state resets cleanly.
  return <ChatWindow key={id} conversationId={id} />;
}
