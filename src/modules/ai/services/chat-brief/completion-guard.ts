import { normalizeText } from "./profile-inference";
import { isCoverageComplete } from "./slot-coverage";
import type { CoverageReport } from "./types";

const COMPLETION_INTENT_PHRASES = [
  "submit",
  "dang du an",
  "dang bai",
  "gui du an",
  "gui bai",
  "nop du an",
  "nop bai",
  "hoan tat",
  "du thong tin",
  "day du thong tin",
  "chap nhan",
  "chot du an",
];

const SAFE_CO_THE_DANG_PATTERNS = [/\bco the dang (?:du an|bai)\b/i, /\bco the (?:gui|nop) (?:du an|bai)\b/i];

export const CLARIFYING_MESSAGE =
  "Mình chưa đủ thông tin để chốt dự án. Bạn bổ sung các mục còn thiếu nhé.";

function looksLikePrematureCompletion(message: string) {
  const normalized = normalizeText(message);
  if (!normalized) return false;

  return (
    COMPLETION_INTENT_PHRASES.some((phrase) => normalized.includes(phrase)) ||
    SAFE_CO_THE_DANG_PATTERNS.some((pattern) => pattern.test(normalized))
  );
}

export function guardCompletion(input: { message: string; coverage: CoverageReport }) {
  const isReadyToSubmit = isCoverageComplete(input.coverage);

  if (!isReadyToSubmit && looksLikePrematureCompletion(input.message)) {
    return {
      isReadyToSubmit,
      message: CLARIFYING_MESSAGE,
    };
  }

  return {
    isReadyToSubmit,
    message: input.message,
  };
}
