import type { Message, MessageRole } from "./api";

export type ChatRole = "user" | "assistant";

export function toChatRole(role: MessageRole): ChatRole {
  return role === "model" ? "assistant" : "user";
}

export interface ChatMessage extends Omit<Message, "role"> {
  role: ChatRole;
  streaming?: boolean;
  pending?: boolean;
  error?: boolean;
}
