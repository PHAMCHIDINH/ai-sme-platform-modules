const CHAT_DRAFT_SCHEMA_VERSION = 1 as const;
const CHAT_DRAFT_STORAGE_PREFIX = "vnsme.chatBriefDraft.v1";

type ParsedData = {
  title: string;
  description: string;
  standardizedBrief: string;
  expectedOutput: string;
  requiredSkills: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  duration: string;
  budget: string;
};

type CoverageState = "missing" | "partial" | "complete";

type CoverageReport = {
  businessContext: CoverageState;
  deliverableScope: CoverageState;
  requiredSkills: CoverageState;
  timelineBudget: CoverageState;
};

type ChatDraftMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  suggestions?: string[];
};

export type ChatDraft = {
  schemaVersion: typeof CHAT_DRAFT_SCHEMA_VERSION;
  messages: ChatDraftMessage[];
  parsedData: ParsedData | null;
  coverage: CoverageReport | null;
  updatedAt: number;
};

function getLocalStorage(): Storage | null {
  try {
    const storage = globalThis.localStorage;
    return storage ?? null;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === "string");
}

function isChatMessage(value: unknown): value is ChatDraftMessage {
  if (!isRecord(value)) return false;
  if (typeof value.id !== "string") return false;
  if (value.role !== "user" && value.role !== "assistant") return false;
  if (typeof value.content !== "string") return false;
  if (value.suggestions !== undefined && !isStringArray(value.suggestions)) return false;
  return true;
}

function isCoverageReport(value: unknown): value is CoverageReport {
  if (!isRecord(value)) return false;
  return (
    value.businessContext !== undefined &&
    value.deliverableScope !== undefined &&
    value.requiredSkills !== undefined &&
    value.timelineBudget !== undefined &&
    [value.businessContext, value.deliverableScope, value.requiredSkills, value.timelineBudget].every(
      state => state === "missing" || state === "partial" || state === "complete",
    )
  );
}

function isParsedData(value: unknown): value is ParsedData {
  if (!isRecord(value)) return false;
  return (
    typeof value.title === "string" &&
    typeof value.description === "string" &&
    typeof value.standardizedBrief === "string" &&
    typeof value.expectedOutput === "string" &&
    typeof value.requiredSkills === "string" &&
    (value.difficulty === "EASY" || value.difficulty === "MEDIUM" || value.difficulty === "HARD") &&
    typeof value.duration === "string" &&
    typeof value.budget === "string"
  );
}

function isChatDraft(value: unknown): value is ChatDraft {
  if (!isRecord(value)) return false;
  if (value.schemaVersion !== CHAT_DRAFT_SCHEMA_VERSION) return false;
  if (!Array.isArray(value.messages) || !value.messages.every(isChatMessage)) return false;
  if (value.parsedData !== null && !isParsedData(value.parsedData)) return false;
  if (value.coverage !== null && !isCoverageReport(value.coverage)) return false;
  if (typeof value.updatedAt !== "number" || !Number.isFinite(value.updatedAt)) return false;
  return true;
}

export function draftStorageKey(userId: string): string {
  return `${CHAT_DRAFT_STORAGE_PREFIX}.${userId}`;
}

export function saveChatDraft(userId: string, draft: ChatDraft): void {
  const storage = getLocalStorage();
  if (!storage) return;

  try {
    storage.setItem(draftStorageKey(userId), JSON.stringify(draft));
  } catch {
    // Ignore browser storage failures.
  }
}

export function loadChatDraft(userId: string): ChatDraft | null {
  const storage = getLocalStorage();
  if (!storage) return null;

  try {
    const rawDraft = storage.getItem(draftStorageKey(userId));
    if (!rawDraft) return null;

    const parsedDraft: unknown = JSON.parse(rawDraft);
    return isChatDraft(parsedDraft) ? parsedDraft : null;
  } catch {
    return null;
  }
}

export function clearChatDraft(userId: string): void {
  const storage = getLocalStorage();
  if (!storage) return;

  try {
    storage.removeItem(draftStorageKey(userId));
  } catch {
    // Ignore browser storage failures.
  }
}
