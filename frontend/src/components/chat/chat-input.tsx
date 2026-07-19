"use client";

import { ArrowUp, Square } from "lucide-react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MAX_HEIGHT = 200;

export interface ChatInputHandle {
  focus: () => void;
}

interface ChatInputProps {
  onSend: (text: string) => void;
  onStop?: () => void;
  isStreaming?: boolean;
  disabled?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}

export const ChatInput = forwardRef<ChatInputHandle, ChatInputProps>(
  function ChatInput(
    {
      onSend,
      onStop,
      isStreaming = false,
      disabled = false,
      placeholder = "Message Nova Chat…",
      autoFocus = false,
    },
    ref,
  ) {
    const [value, setValue] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useImperativeHandle(ref, () => ({
      focus: () => textareaRef.current?.focus(),
    }));

    // Auto-grow the textarea up to a max height.
    const resize = useCallback(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
    }, []);

    useEffect(() => resize(), [value, resize]);
    useEffect(() => {
      if (autoFocus) textareaRef.current?.focus();
    }, [autoFocus]);

    const submit = () => {
      const text = value.trim();
      if (!text || disabled || isStreaming) return;
      onSend(text);
      setValue("");
      requestAnimationFrame(resize);
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
        e.preventDefault();
        submit();
      }
    };

    const canSend = value.trim().length > 0 && !disabled;

    return (
      <div className="mx-auto w-full max-w-3xl px-4 pb-4 pt-2">
        <div
          className={cn(
            "relative flex items-end gap-2 rounded-3xl border border-border bg-card p-2 pl-4 shadow-sm transition-shadow focus-within:border-ring/60 focus-within:shadow-md",
          )}
        >
          <textarea
            ref={textareaRef}
            value={value}
            rows={1}
            disabled={disabled}
            placeholder={placeholder}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            className="scrollbar-thin max-h-[200px] flex-1 resize-none self-center bg-transparent py-2 text-[15px] leading-6 outline-none placeholder:text-muted-foreground disabled:opacity-60"
          />

          {isStreaming ? (
            <Button
              type="button"
              size="icon"
              onClick={onStop}
              className="size-9 shrink-0 rounded-full"
              aria-label="Stop generating"
            >
              <Square className="size-4 fill-current" />
            </Button>
          ) : (
            <Button
              type="button"
              size="icon"
              onClick={submit}
              disabled={!canSend}
              className="size-9 shrink-0 rounded-full transition-transform active:scale-95"
              aria-label="Send message"
            >
              <ArrowUp className="size-5" />
            </Button>
          )}
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Press <kbd className="font-sans font-medium">Enter</kbd> to send,{" "}
          <kbd className="font-sans font-medium">Shift + Enter</kbd> for a new
          line.
        </p>
      </div>
    );
  },
);
