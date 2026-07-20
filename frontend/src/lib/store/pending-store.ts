import { create } from "zustand";

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
