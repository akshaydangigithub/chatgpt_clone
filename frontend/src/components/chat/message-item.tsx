"use client";

import { motion } from "framer-motion";
import { Check, Copy, RotateCcw } from "lucide-react";

import { Logo } from "@/components/common/logo";
import { Markdown } from "@/components/chat/markdown";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getInitials } from "@/lib/format";
import { useCopyToClipboard } from "@/lib/hooks/use-copy-to-clipboard";
import { useAuthStore } from "@/lib/store/auth-store";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/chat";

export function MessageItem({
  message,
  onRegenerate,
  isLast,
}: {
  message: ChatMessage;
  onRegenerate?: () => void;
  isLast?: boolean;
}) {
  const isUser = message.role === "user";
  const username = useAuthStore((s) => s.user?.username ?? "You");
  const { copied, copy } = useCopyToClipboard();

  const showTyping =
    !isUser && message.streaming && message.content.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={cn(
        "group/msg flex gap-3 md:gap-4",
        isUser && "flex-row-reverse",
      )}
    >
      {/* Avatar */}
      <div className="shrink-0 pt-0.5">
        {isUser ? (
          <Avatar className="size-8">
            <AvatarFallback className="bg-secondary text-xs font-semibold">
              {getInitials(username)}
            </AvatarFallback>
          </Avatar>
        ) : (
          <Logo size={32} />
        )}
      </div>

      {/* Bubble + actions */}
      <div
        className={cn(
          "flex min-w-0 max-w-[calc(100%-3rem)] flex-col gap-1.5",
          isUser ? "items-end" : "items-start",
        )}
      >
        <div
          className={cn(
            "w-fit max-w-full rounded-2xl px-4 py-2.5 text-[15px] leading-7",
            isUser
              ? "rounded-tr-sm bg-primary text-primary-foreground"
              : "rounded-tl-sm bg-muted/60",
            message.error && "border border-destructive/40",
          )}
        >
          {showTyping ? (
            <TypingIndicator />
          ) : isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <Markdown
              content={message.content}
              className={cn(message.streaming && "cursor-blink")}
            />
          )}
        </div>

        {/* Action row (assistant, once complete) */}
        {!isUser && !message.streaming && message.content.length > 0 && (
          <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover/msg:opacity-100">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground"
                    onClick={() => copy(message.content)}
                    aria-label="Copy message"
                  />
                }
              >
                {copied ? (
                  <Check className="size-3.5 text-emerald-500" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </TooltipTrigger>
              <TooltipContent>Copy</TooltipContent>
            </Tooltip>

            {isLast && onRegenerate && (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground"
                      onClick={onRegenerate}
                      aria-label="Regenerate response"
                    />
                  }
                >
                  <RotateCcw className="size-3.5" />
                </TooltipTrigger>
                <TooltipContent>Regenerate</TooltipContent>
              </Tooltip>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
