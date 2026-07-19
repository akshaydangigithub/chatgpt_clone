import { isThisYear, isToday, isYesterday } from "date-fns";

import type { Conversation } from "@/types/api";

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** A concise, human date label for a message timestamp. */
export function formatMessageTime(iso: string): string {
  const date = new Date(iso);
  const time = date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  if (isToday(date)) return time;
  if (isYesterday(date)) return `Yesterday ${time}`;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    ...(isThisYear(date) ? {} : { year: "numeric" }),
  });
}

export type ConversationGroupLabel =
  | "Today"
  | "Yesterday"
  | "Previous 7 Days"
  | "Previous 30 Days"
  | "Older";

export interface ConversationGroup {
  label: ConversationGroupLabel;
  conversations: Conversation[];
}

const DAY = 24 * 60 * 60 * 1000;

/** Bucket conversations into ChatGPT-style time groups (already sorted desc). */
export function groupConversationsByDate(
  conversations: Conversation[],
): ConversationGroup[] {
  const now = Date.now();
  const buckets: Record<ConversationGroupLabel, Conversation[]> = {
    Today: [],
    Yesterday: [],
    "Previous 7 Days": [],
    "Previous 30 Days": [],
    Older: [],
  };

  for (const c of conversations) {
    const date = new Date(c.created_at);
    const age = now - date.getTime();
    if (isToday(date)) buckets.Today.push(c);
    else if (isYesterday(date)) buckets.Yesterday.push(c);
    else if (age < 7 * DAY) buckets["Previous 7 Days"].push(c);
    else if (age < 30 * DAY) buckets["Previous 30 Days"].push(c);
    else buckets.Older.push(c);
  }

  return (Object.keys(buckets) as ConversationGroupLabel[])
    .map((label) => ({ label, conversations: buckets[label] }))
    .filter((g) => g.conversations.length > 0);
}

export function conversationTitle(conversation: {
  title: string | null;
}): string {
  return conversation.title?.trim() || "New chat";
}
