import type { Message, MessageRole } from "./api";

/** Client-side chat roles, normalised from the backend vocabulary. */
export type ChatRole = "user" | "assistant";

export function toChatRole(role: MessageRole): ChatRole {
  return role === "model" ? "assistant" : "user";
}

/**
 * A message as rendered in the UI. Extends the persisted shape with transient
 * client-only flags used while a response is streaming.
 */
export interface ChatMessage extends Omit<Message, "role"> {
  role: ChatRole;
  /** True while tokens are still arriving for this (assistant) message. */
  streaming?: boolean;
  /** True if this message hasn't been persisted by the backend yet. */
  pending?: boolean;
  /** True if generation failed for this message. */
  error?: boolean;
}
