"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/client";
import { conversationsApi } from "@/lib/api/conversations";
import { ROUTES } from "@/lib/constants";
import { usePendingStore } from "@/lib/store/pending-store";

/**
 * Starts a brand-new conversation from the home screen: create it on the
 * backend, stash the first prompt, then navigate to the conversation page
 * which picks up and streams the pending message.
 */
export function useStartNewChat() {
  const router = useRouter();
  const setPending = usePendingStore((s) => s.setPending);
  const [isCreating, setIsCreating] = useState(false);

  const start = useCallback(
    async (message: string) => {
      const trimmed = message.trim();
      if (!trimmed || isCreating) return;
      setIsCreating(true);
      try {
        const conversation = await conversationsApi.create();
        setPending(conversation.id, trimmed);
        router.push(ROUTES.conversation(conversation.id));
      } catch (error) {
        toast.error(getErrorMessage(error));
        setIsCreating(false);
      }
    },
    [isCreating, router, setPending],
  );

  return { start, isCreating };
}
