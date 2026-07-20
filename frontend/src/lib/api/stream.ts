import { env } from "@/config/env";
import { ApiError } from "./client";
import { clearAuth, getAuthToken } from "@/lib/store/auth-store";
import type { ChatRequest } from "@/types/api";

export interface StreamHandlers {
  onChunk: (text: string) => void;
  onDone: () => void;
  onError: (message: string) => void;
}

function parseFrame(frame: string): { event: string; data: string } | null {
  let event = "message";
  const dataLines: string[] = [];

  for (const rawLine of frame.split("\n")) {
    const line = rawLine.trimEnd();
    if (!line || line.startsWith(":")) continue; // heartbeat / comment
    if (line.startsWith("event:")) {
      event = line.slice(6).trim();
    } else if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).trim());
    }
  }

  if (dataLines.length === 0 && event === "message") return null;
  return { event, data: dataLines.join("\n") };
}

export async function streamChat(
  body: ChatRequest,
  handlers: StreamHandlers,
  signal?: AbortSignal,
): Promise<void> {
  const token = getAuthToken();

  let response: Response;
  try {
    response = await fetch(`${env.apiUrl}/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
      signal,
    });
  } catch (err) {
    if ((err as Error).name === "AbortError") return;
    handlers.onError("Network error. Please check your connection.");
    return;
  }

  if (response.status === 401) {
    clearAuth();
    throw new ApiError("Your session has expired. Please sign in again.", 401);
  }

  if (!response.ok || !response.body) {
    let detail = `Request failed (${response.status}).`;
    try {
      const json = await response.json();
      detail = json.detail || json.message || detail;
    } catch {
      /* keep the default */
    }
    handlers.onError(detail);
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      let boundary: number;
      while ((boundary = buffer.indexOf("\n\n")) !== -1) {
        const frame = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);

        const parsed = parseFrame(frame);
        if (!parsed) continue;

        if (parsed.event === "message") {
          try {
            const { text } = JSON.parse(parsed.data) as { text: string };
            if (text) handlers.onChunk(text);
          } catch {
            /* ignore malformed frame */
          }
        } else if (parsed.event === "done") {
          handlers.onDone();
          return;
        } else if (parsed.event === "error") {
          let message = "The AI service failed to respond.";
          try {
            message = (JSON.parse(parsed.data) as { message: string }).message;
          } catch {
            /* keep default */
          }
          handlers.onError(message);
          return;
        }
      }
    }
    // Stream closed without an explicit `done` event — treat as complete.
    handlers.onDone();
  } catch (err) {
    if ((err as Error).name === "AbortError") return;
    handlers.onError("The connection was interrupted.");
  } finally {
    reader.releaseLock();
  }
}
