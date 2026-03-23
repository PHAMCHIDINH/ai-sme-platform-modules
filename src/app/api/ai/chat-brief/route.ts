import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  CHAT_BRIEF_SYSTEM_PROMPT,
  EMPTY_PARSED_DATA,
  buildDeterministicResponse,
  buildOfflineResponse,
  chatModelStr,
  normalizeAIResponseContent,
  openaiInstance,
  parseIncomingMessages,
  toAIChatMessages,
  type ChatBriefResponse,
  type ChatMessageInput,
  type ParsedData,
} from "@/modules/ai";

const MAX_OUTBOUND_CHAT_TURNS = 16;
const PARSED_DATA_FIELDS = Object.keys(EMPTY_PARSED_DATA) as Array<keyof ParsedData>;

function ensureChatBriefResponse(
  response: Partial<ChatBriefResponse>,
  messages: ChatMessageInput[],
  contextParsedData?: Partial<ParsedData> | null,
): ChatBriefResponse {
  const parsedData = mergeParsedData(response.parsedData, contextParsedData);
  return buildDeterministicResponse(parsedData, messages);
}

function boundOutboundHistory(messages: ChatMessageInput[]) {
  return messages.slice(-MAX_OUTBOUND_CHAT_TURNS);
}

function isDifficulty(value: unknown): value is ParsedData["difficulty"] {
  return value === "EASY" || value === "MEDIUM" || value === "HARD";
}

function getNonEmptyString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function readContextParsedData(body: unknown): Partial<ParsedData> | null {
  if (typeof body !== "object" || body === null) return null;

  const requestBody = body as Record<string, unknown>;
  const context = requestBody.context;
  if (typeof context !== "object" || context === null || !("parsedData" in context)) {
    return null;
  }

  const contextRecord = context as Record<string, unknown>;
  const parsedData = contextRecord.parsedData;
  if (typeof parsedData !== "object" || parsedData === null) {
    return null;
  }

  const candidate = parsedData as Record<string, unknown>;
  const contextParsedData: Partial<ParsedData> = {};

  PARSED_DATA_FIELDS.forEach((field) => {
    const value = candidate[field];

    if (field === "difficulty") {
      if (isDifficulty(value)) {
        contextParsedData[field] = value;
      }
      return;
    }

    const text = getNonEmptyString(value);
    if (text) {
      contextParsedData[field] = text;
    }
  });

  return Object.keys(contextParsedData).length > 0 ? contextParsedData : null;
}

function mergeParsedData(primary?: Partial<ParsedData>, fallback?: Partial<ParsedData> | null): ParsedData {
  const merged = { ...EMPTY_PARSED_DATA };

  PARSED_DATA_FIELDS.forEach((field) => {
    if (field === "difficulty") {
      merged[field] = isDifficulty(primary?.[field])
        ? primary[field]
        : isDifficulty(fallback?.[field])
          ? fallback[field]
          : EMPTY_PARSED_DATA[field];
      return;
    }

    merged[field] = getNonEmptyString(primary?.[field]) || getNonEmptyString(fallback?.[field]) || EMPTY_PARSED_DATA[field];
  });

  return merged;
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Bạn chưa đăng nhập." }, { status: 401 });
    }

    const body = await req.json();
    const incomingMessages = parseIncomingMessages(body?.messages);
    const contextParsedData = readContextParsedData(body);

    if (!incomingMessages) {
      return NextResponse.json({ error: "Định dạng hội thoại không hợp lệ." }, { status: 400 });
    }

    const messages = boundOutboundHistory(incomingMessages);

    if (!openaiInstance) {
      return NextResponse.json(ensureChatBriefResponse(buildOfflineResponse(messages), messages, contextParsedData));
    }

    const response = await openaiInstance.chat.completions.create({
      model: chatModelStr,
      messages: [{ role: "system", content: CHAT_BRIEF_SYSTEM_PROMPT }, ...toAIChatMessages(messages)],
      response_format: { type: "json_object" },
      temperature: 0.25,
      max_tokens: 800,
    });

    const aiText = response.choices[0]?.message?.content || "{}";
    return NextResponse.json(ensureChatBriefResponse(normalizeAIResponseContent(aiText, messages), messages, contextParsedData));
  } catch (error) {
    console.error("[CHAT_BRIEF_ERROR]", error);
    return NextResponse.json({ error: "Không thể xử lý hội thoại lúc này." }, { status: 500 });
  }
}
