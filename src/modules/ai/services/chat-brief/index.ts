import { parseChatMessages } from "./message-parser";
import { CHAT_BRIEF_SYSTEM_PROMPT } from "./prompt-builder";
import { buildFallbackParsedData } from "./profile-inference";
import { buildDeterministicResponse, normalizeResponse, safeParseJSON } from "./response-normalizer";
export * from "./question-planner";
import { EMPTY_PARSED_DATA } from "./types";
import type { ChatBriefResponse, ChatMessageInput, ParsedData } from "./types";

export function parseIncomingMessages(rawMessages: unknown): ChatMessageInput[] | null {
  return parseChatMessages(rawMessages);
}

export function toAIChatMessages(messages: ChatMessageInput[]) {
  return messages.map((message): { role: "assistant" | "user"; content: string } => ({
    role: message.role === "assistant" ? "assistant" : "user",
    content: message.content,
  }));
}

export function buildOfflineResponse(messages: ChatMessageInput[]): ChatBriefResponse {
  const parsedData = buildFallbackParsedData(messages);
  return buildDeterministicResponse(parsedData, messages);
}

export function normalizeAIResponseContent(aiText: string, messages: ChatMessageInput[]): ChatBriefResponse {
  const parsedPayload = safeParseJSON(aiText);
  return normalizeResponse(parsedPayload, messages);
}

export { CHAT_BRIEF_SYSTEM_PROMPT, buildDeterministicResponse, EMPTY_PARSED_DATA };
export type { ChatBriefResponse, ChatMessageInput, ParsedData };
