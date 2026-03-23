import { getLastUserMessage, getUserMessages } from "./message-parser";
import { guardCompletion } from "./completion-guard";
import {
  buildFallbackParsedData,
  inferProjectProfile,
  isAdviceRequest,
  normalizeDifficulty,
  rebuildStandardizedBrief,
} from "./profile-inference";
import { planNextQuestion } from "./question-planner";
import { getNextSlot, scoreCoverage } from "./slot-coverage";
import { EMPTY_PARSED_DATA, type ChatBriefResponse, type ChatMessageInput, type NextField, type ParsedData } from "./types";

const FIELD_ALIASES: Record<keyof ParsedData, string[]> = {
  title: ["title", "projectTitle", "name", "tenDuAn", "ten_du_an"],
  description: ["description", "rawBrief", "problem", "moTa", "mota", "nhatKyTho"],
  standardizedBrief: ["standardizedBrief", "standardized_brief", "brief", "moTaChuanHoa", "mo_ta_chuan_hoa"],
  expectedOutput: ["expectedOutput", "deliverables", "output", "ketQuaBanGiao", "ket_qua_ban_giao"],
  requiredSkills: ["requiredSkills", "required_skills", "skills", "kyNangCanCo", "ky_nang_can_co"],
  difficulty: ["difficulty", "level", "mucDoKho", "muc_do_kho"],
  duration: ["duration", "timeline", "thoiGianTrienKhai", "thoi_gian_trien_khai", "time"],
  budget: ["budget", "budgetRange", "nganSach", "ngan_sach"],
};

function valueToString(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);

  if (Array.isArray(value)) {
    return value
      .map((item) => valueToString(item))
      .filter(Boolean)
      .join(", ")
      .trim();
  }

  if (typeof value === "object") {
    const nestedValues = Object.values(value as Record<string, unknown>)
      .map((item) => valueToString(item))
      .filter(Boolean);
    return nestedValues.join("\n").trim();
  }

  return "";
}

function asObject(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
}

function getByAliases(source: Record<string, unknown>, aliases: string[]): unknown {
  const table = new Map<string, unknown>();
  Object.entries(source).forEach(([key, value]) => {
    table.set(key.toLowerCase(), value);
  });

  for (const alias of aliases) {
    const hit = table.get(alias.toLowerCase());
    if (hit !== undefined) return hit;
  }

  return undefined;
}

function sanitizeExtractedValue(field: keyof ParsedData, value: unknown) {
  const text = valueToString(value);
  if (!text) return "";
  if (field !== "description" && field !== "standardizedBrief" && isAdviceRequest(text)) {
    return "";
  }
  return text;
}

function normalizeParsedData(rawObject: Record<string, unknown>, messages: ChatMessageInput[]): ParsedData {
  const parsedDataObject = asObject(rawObject.parsedData);
  const fallback = buildFallbackParsedData(messages);

  const normalized: ParsedData = { ...EMPTY_PARSED_DATA };

  (Object.keys(EMPTY_PARSED_DATA) as Array<keyof ParsedData>).forEach((field) => {
    if (field === "difficulty" || field === "description" || field === "standardizedBrief") return;

    const rawValue =
      getByAliases(parsedDataObject, FIELD_ALIASES[field]) ??
      getByAliases(rawObject, FIELD_ALIASES[field]);

    normalized[field] = sanitizeExtractedValue(field, rawValue) || fallback[field];
  });

  normalized.description = fallback.description;

  const rawDifficulty =
    sanitizeExtractedValue("difficulty", getByAliases(parsedDataObject, FIELD_ALIASES.difficulty)) ||
    sanitizeExtractedValue("difficulty", getByAliases(rawObject, FIELD_ALIASES.difficulty));

  normalized.difficulty = rawDifficulty ? normalizeDifficulty(rawDifficulty) : fallback.difficulty;
  normalized.standardizedBrief = rebuildStandardizedBrief(normalized, messages);

  return normalized;
}

export function safeParseJSON(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      const sliced = text.slice(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(sliced);
      } catch {
        return {};
      }
    }
    return {};
  }
}

export function getNextField(parsedData: ParsedData): NextField {
  if (!parsedData.requiredSkills) return "requiredSkills";
  if (!parsedData.expectedOutput) return "expectedOutput";
  if (!parsedData.duration) return "duration";
  return "completed";
}

function buildCompletionMessage(parsedData: ParsedData) {
  if (!parsedData.budget) {
    return "Mình đã điền đủ các trường chính để đăng dự án. Nếu có ngân sách hoặc quyền lợi thì bạn bổ sung thêm ở form bên phải, còn không có thể bấm Đăng Dự Án luôn.";
  }

  return "Mình đã điền đủ thông tin form bên cạnh, bạn hãy kiểm tra lại và bấm Đăng Dự Án nhé!";
}

function dedupeSuggestions(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function buildTimelineBudgetSuggestions(durationSuggestions: string[], budgetSuggestions: string[]) {
  const durations = dedupeSuggestions(durationSuggestions);
  const budgets = dedupeSuggestions(budgetSuggestions);
  const limit = Math.min(durations.length, budgets.length, 4);

  if (limit === 0) return [];

  return Array.from({ length: limit }, (_, index) => `${durations[index]}, ${budgets[index]}`);
}

function buildSlotSuggestions(
  nextSlot: ReturnType<typeof getNextSlot>,
  profile: ReturnType<typeof inferProjectProfile>,
  fallbackSuggestions: string[],
) {
  if (nextSlot === "requiredSkills" && profile.skillSuggestions.length > 0) {
    return dedupeSuggestions(profile.skillSuggestions).slice(0, 4);
  }

  if (nextSlot === "deliverableScope" && profile.outputSuggestions.length > 0) {
    return dedupeSuggestions(profile.outputSuggestions).slice(0, 4);
  }

  if (nextSlot === "timelineBudget") {
    const combined = buildTimelineBudgetSuggestions(profile.durationSuggestions, profile.budgetSuggestions);
    if (combined.length > 0) return combined;
  }

  return dedupeSuggestions(fallbackSuggestions).slice(0, 4);
}

export function buildAssistantReply(
  parsedData: ParsedData,
  messages: ChatMessageInput[],
): Pick<ChatBriefResponse, "message" | "suggestions"> {
  const response = buildDeterministicResponse(parsedData, messages);
  return {
    message: response.message,
    suggestions: response.suggestions,
  };
}

export function buildDeterministicResponse(parsedData: ParsedData, messages: ChatMessageInput[]): ChatBriefResponse {
  const userMessages = getUserMessages(messages);
  const profile = inferProjectProfile(userMessages, parsedData.title, parsedData.description);
  const coverage = scoreCoverage(parsedData, userMessages);
  const nextSlot = getNextSlot(coverage);
  const planner = planNextQuestion({
    coverage,
    profileLabel: profile.label,
    parsedData,
  });
  const suggestions = nextSlot === "completed" ? [] : buildSlotSuggestions(nextSlot, profile, planner.suggestions);
  const lastUserMessage = getLastUserMessage(messages);
  const needsAdvice = isAdviceRequest(lastUserMessage);

  const replyMessage =
    nextSlot === "completed"
      ? buildCompletionMessage(parsedData)
      : needsAdvice && suggestions.length > 0
        ? `${planner.message} Bạn có thể chọn nhanh một phương án bên dưới nếu phù hợp.`
        : planner.message;

  const guarded = guardCompletion({
    message: replyMessage,
    coverage,
  });

  return {
    message: guarded.message,
    suggestions,
    parsedData,
    coverage,
    nextSlot,
    isReadyToSubmit: guarded.isReadyToSubmit,
  };
}

export function normalizeResponse(rawPayload: unknown, messages: ChatMessageInput[]): ChatBriefResponse {
  const rawObject = asObject(rawPayload);
  const parsedData = normalizeParsedData(rawObject, messages);
  return buildDeterministicResponse(parsedData, messages);
}

export { EMPTY_PARSED_DATA };
export type { ChatMessageInput };
