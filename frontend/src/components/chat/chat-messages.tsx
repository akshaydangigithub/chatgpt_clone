"use client";

import { ArrowDown } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { MessageItem } from "@/components/chat/message-item";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/chat";

export function ChatMessages({
  messages,
  isStreaming,
  onRegenerate,
}: {
  messages: ChatMessage[];
  isStreaming: boolean;
  onRegenerate: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [atBottom, setAtBottom] = useState(true);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);

  // Track whether the user is near the bottom so we don't yank them back up.
  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    setAtBottom(distance < 120);
  }, []);

  // Auto-follow new content only while pinned to the bottom.
  const lastContent = messages[messages.length - 1]?.content;
  useEffect(() => {
    if (atBottom) scrollToBottom(isStreaming ? "auto" : "smooth");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length, lastContent, atBottom]);

  return (
    <div className="relative min-h-0 flex-1">
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="scrollbar-thin h-full overflow-y-auto"
      >
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 md:py-8">
          {messages.map((message, i) => (
            <MessageItem
              key={message.id}
              message={message}
              isLast={i === messages.length - 1}
              onRegenerate={onRegenerate}
            />
          ))}
          <div ref={bottomRef} className="h-px" />
        </div>
      </div>

      {/* Jump-to-latest */}
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-4 flex justify-center transition-opacity",
          atBottom ? "opacity-0" : "opacity-100",
        )}
      >
        <Button
          size="icon"
          variant="outline"
          onClick={() => scrollToBottom()}
          className={cn(
            "pointer-events-auto size-9 rounded-full bg-background shadow-md",
            atBottom && "pointer-events-none",
          )}
          aria-label="Scroll to latest"
        >
          <ArrowDown className="size-4" />
        </Button>
      </div>
    </div>
  );
}
