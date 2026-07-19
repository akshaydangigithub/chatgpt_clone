"use client";

import { memo } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

import { CodeBlock } from "@/components/chat/code-block";
import { cn } from "@/lib/utils";

const components: Components = {
  // Let our custom code renderer own the <pre>, so we drop the default wrapper
  // to avoid a doubly-nested <pre>.
  pre: ({ children }) => <>{children}</>,
  code: ({ className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || "");
    // Block code (has a language class or spans multiple lines).
    if (match) {
      return (
        <CodeBlock language={match[1]} className={className}>
          {children}
        </CodeBlock>
      );
    }
    // Inline code.
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
  a: ({ children, ...props }) => (
    <a target="_blank" rel="noreferrer noopener" {...props}>
      {children}
    </a>
  ),
};

/** Renders assistant markdown with GFM + syntax highlighting. Memoised so a
 * streaming parent only re-parses when the text actually changes. */
export const Markdown = memo(function Markdown({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  return (
    <div className={cn("prose-chat", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeHighlight, { detect: true, ignoreMissing: true }]]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});
