"use client";

import { useCallback, useRef, useState } from "react";

/** Copy text to the clipboard and expose a transient `copied` flag. */
export function useCopyToClipboard(resetDelay = 2000) {
  const [copied, setCopied] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        if (timeout.current) clearTimeout(timeout.current);
        timeout.current = setTimeout(() => setCopied(false), resetDelay);
        return true;
      } catch {
        return false;
      }
    },
    [resetDelay],
  );

  return { copied, copy };
}
