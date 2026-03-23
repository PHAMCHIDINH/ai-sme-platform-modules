export type ChatMessageInput = {
  role: string;
  content: string;
};

export type ParsedData = {
  title: string;
  description: string;
  standardizedBrief: string;
  expectedOutput: string;
  requiredSkills: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  duration: string;
  budget: string;
};

export type SlotKey = "businessContext" | "deliverableScope" | "requiredSkills" | "timelineBudget";

export type SlotState = "missing" | "partial" | "complete";

export type CoverageReport = Record<SlotKey, SlotState>;

export type ChatBriefResponse = {
  message: string;
  suggestions: string[];
  parsedData: ParsedData;
  coverage: CoverageReport;
  nextSlot: SlotKey | "completed";
  isReadyToSubmit: boolean;
};

export type NextField = "requiredSkills" | "expectedOutput" | "duration" | "completed";

export type ProjectCategory =
  | "ecommerce"
  | "website"
  | "internal-tool"
  | "mobile-app"
  | "marketing"
  | "data"
  | "automation"
  | "generic";

export type ProjectProfile = {
  category: ProjectCategory;
  label: string;
  defaultTitle: string;
  defaultGoal: string;
  platformHint: string;
  defaultOutput: string;
  skillSuggestions: string[];
  outputSuggestions: string[];
  durationSuggestions: string[];
  budgetSuggestions: string[];
};

export const EMPTY_PARSED_DATA: ParsedData = {
  title: "",
  description: "",
  standardizedBrief: "",
  expectedOutput: "",
  requiredSkills: "",
  difficulty: "MEDIUM",
  duration: "",
  budget: "",
};
