"use client";

import { AnimatePresence } from "framer-motion";
import { MessageSquareOff, SearchX } from "lucide-react";
import { useParams } from "next/navigation";

import { ConversationItem } from "@/components/sidebar/conversation-item";
import { Skeleton } from "@/components/ui/skeleton";
import { groupConversationsByDate } from "@/lib/format";
import type { Conversation } from "@/types/api";

function EmptyState({ searching }: { searching: boolean }) {
  const Icon = searching ? SearchX : MessageSquareOff;
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-10 text-center text-sm text-muted-foreground">
      <Icon className="size-6 opacity-60" />
      <p>{searching ? "No conversations found" : "No conversations yet"}</p>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-2 px-1 py-2">
      {Array.from({ length: 7 }).map((_, i) => (
        <Skeleton key={i} className="h-8 w-full rounded-lg" />
      ))}
    </div>
  );
}

export function ConversationList({
  conversations,
  isLoading,
  searching,
  onNavigate,
}: {
  conversations: Conversation[];
  isLoading: boolean;
  searching: boolean;
  onNavigate?: () => void;
}) {
  const params = useParams();
  const activeId = typeof params?.id === "string" ? params.id : undefined;

  if (isLoading) return <ListSkeleton />;
  if (conversations.length === 0) return <EmptyState searching={searching} />;

  const groups = groupConversationsByDate(conversations);

  return (
    <div className="space-y-4 px-1 pb-2">
      {groups.map((group) => (
        <div key={group.label} className="space-y-0.5">
          <h3 className="px-3 py-1 text-xs font-medium text-muted-foreground/70">
            {group.label}
          </h3>
          <AnimatePresence initial={false}>
            {group.conversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                active={conversation.id === activeId}
                onNavigate={onNavigate}
              />
            ))}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
