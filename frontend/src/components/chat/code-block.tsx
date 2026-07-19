"use client";

import { Check, Copy } from "lucide-react";
import { useRef } from "react";

import { useCopyToClipboard } from "@/lib/hooks/use-copy-to-clipboard";
import { cn } from "@/lib/utils";

/**
 * A fenced code block with a language label and copy button. The highlighted
 * child nodes (produced by rehype-highlight) are rendered as-is; copy reads the
 * raw text content off the DOM so it never includes markup.
 */
export function CodeBlock({
  language,
  className,
  children,
}: {
  language?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const codeRef = useRef<HTMLElement>(null);
  const { copied, copy } = useCopyToClipboard();

  const onCopy = () => {
    const text = codeRef.current?.textContent ?? "";
    void copy(text);
  };

  return (
    <div className="group/code my-4 overflow-hidden rounded-xl border border-border bg-[color-mix(in_oklch,var(--muted)_40%,var(--background))]">
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-4 py-1.5">
        <span className="font-mono text-xs text-muted-foreground">
          {language || "code"}
        </span>
        <button
          type="button"
          onClick={onCopy}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-emerald-500" /> Copied
            </>
          ) : (
            <>
              <Copy className="size-3.5" /> Copy
            </>
          )}
        </button>
      </div>
      <pre className="scrollbar-thin overflow-x-auto p-4">
        <code ref={codeRef} className={cn("hljs bg-transparent", className)}>
          {children}
        </code>
      </pre>
    </div>
  );
}
