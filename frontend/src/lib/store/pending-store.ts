import { create } from "zustand";

/**
 * Bridges the "new chat" screen and the conversation screen.
 *
 * When a user sends the first message from `/`, we create the conversation,
 * stash the message here keyed by the new conversation id, and navigate to
 * `/c/:id`. That page then *consumes* the pending message and kicks off the
 * stream — so the first prompt survives the route change without a query param.
 */
interface PendingState {
  pending: Record<string, string>;
  setPending: (conversationId: string, message: string) => void;
  consumePending: (conversationId: string) => string | null;
}

export const usePendingStore = create<PendingState>((set, get) => ({
  pending: {},
  setPending: (conversationId, message) =>
    set((state) => ({
      pending: { ...state.pending, [conversationId]: message },
    })),
  consumePending: (conversationId) => {
    const message = get().pending[conversationId];
    if (message === undefined) return null;
    set((state) => {
      const next = { ...state.pending };
      delete next[conversationId];
      return { pending: next };
    });
    return message;
  },
}));
