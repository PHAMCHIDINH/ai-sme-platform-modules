import type { ChatMessageInput } from "./types";

export function parseChatMessages(rawMessages: unknown): ChatMessageInput[] | null {
  if (!Array.isArray(rawMessages)) {
    return null;
  }

  return rawMessages
    .filter(
      (message: unknown): message is { role: string; content: string } =>
        typeof message === "object" &&
        message !== null &&
        "role" in message &&
        "content" in message &&
        typeof (message as { role: unknown }).role === "string" &&
        typeof (message as { content: unknown }).content === "string",
    )
    .map((message) => ({
      role: message.role,
      content: message.content,
    }));
}

export function getUserMessages(messages: ChatMessageInput[]) {
  return messages
    .filter((message) => message.role === "user")
    .map((message) => message.content.trim())
    .filter(Boolean);
}

export function getLastUserMessage(messages: ChatMessageInput[]) {
  return [...messages].reverse().find((message) => message.role === "user")?.content.trim() ?? "";
}
