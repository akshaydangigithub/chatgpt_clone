/* ----------------------------------------------------------------- Auth -- */

export interface User {
  id: string;
  username: string;
  email: string;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

/* --------------------------------------------------------- Conversations -- */

export interface Conversation {
  id: string;
  title: string | null;
  created_at: string;
}

export interface ConversationListResponse {
  conversations: Conversation[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

/* -------------------------------------------------------------- Messages -- */

export type MessageRole = "user" | "model";

export interface Message {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  created_at: string;
}

export interface MessageListResponse {
  messages: Message[];
}

/* ------------------------------------------------------------------ Chat -- */

export interface ChatRequest {
  conversation_id: string;
  message: string;
}

export interface AIResponse {
  answer: string;
  category: string;
  confidence: number;
}

/* ------------------------------------------------------ SSE stream events -- */

export type StreamEvent =
  | { type: "message"; text: string }
  | { type: "done" }
  | { type: "error"; message: string };

/* ----------------------------------------------------------------- Error -- */

export interface ApiErrorBody {
  detail?: string;
  message?: string;
}
