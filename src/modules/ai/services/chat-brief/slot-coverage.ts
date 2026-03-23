import { normalizeText } from "./profile-inference";
import type { CoverageReport, ParsedData, SlotKey, SlotState } from "./types";

const BUSINESS_CONTEXT_PATTERNS = [
  /\bdoanh nghiep\b/i,
  /\bcong ty\b/i,
  /\bcua hang\b/i,
  /\bshop\b/i,
  /\bnha hang\b/i,
  /\bbenh vien\b/i,
  /\btruong hoc\b/i,
  /\blogistics\b/i,
  /\bthuong hieu\b/i,
  /\bmy pham\b/i,
  /\bkhach san mini\b/i,
  /\bkhach san\b/i,
  /\bphong gym\b/i,
  /\bgym\b/i,
  /\bchuoi ca phe\b/i,
  /\bca phe\b/i,
];

const SPA_BUSINESS_CONTEXT_PATTERNS = [
  /\bspa\b.*\b(tham my|cham soc|lam dep|massage|nail|skincare|wellness|my pham)\b/i,
  /\b(tham my|cham soc|lam dep|massage|nail|skincare|wellness|my pham)\b.*\bspa\b/i,
];

const DELIVERABLE_ARTIFACT_PATTERNS = [
  /\bung dung\b/i,
  /\bweb app\b/i,
  /\bapp\b/i,
  /\bwebsite\b/i,
  /\blanding page\b/i,
  /\bdashboard\b/i,
  /\badmin\b/i,
  /\bsource code\b/i,
  /\bapi\b/i,
  /\bform\b/i,
  /\bprototype\b/i,
  /\btool\b/i,
  /\bportal\b/i,
  /\bbo content\b/i,
  /\bcontent fanpage\b/i,
  /\bnoi dung fanpage\b/i,
  /\bcontent plan\b/i,
  /\bke hoach noi dung\b/i,
  /\bbai viet\b/i,
];

const SCOPE_QUANTITY_PATTERNS = [
  /\b\d+\s*(?:man hinh|màn hình|module|modules|screen|screens|trang|pages|bai|bài|post|posts|luong|luồng|flow|flows|bao cao|báo cáo|report|reports|endpoint|endpoints|feature|features|section|sections|tab|tabs|quy trinh|quy trình|workflow|workflows|item|items)\b/i,
  /\b\d+\s*(?:bai|bài|post|posts|noi dung|nội dung|story|stories)\s*\/\s*(?:thang|tháng|tuan|tuần|week)\b/i,
  /\b\d+\s*(?:bai|bài|post|posts|story|stories)\s*(?:moi|per)\s*(?:thang|tháng|tuan|tuần|week)\b/i,
  /\b(?:moi|per)\s*(?:tuan|week)\b/i,
  /\b(?:toi da|tối đa|toi thieu|tối thiểu|gioi han|giới hạn|khong qua|không quá)\b/i,
];

const SKILL_EVIDENCE_PATTERNS = [
  /\breact\b/i,
  /\bnode\.?js\b/i,
  /\bnext\.?js\b/i,
  /\bvue(\.js)?\b/i,
  /\bflutter\b/i,
  /\bphp\b/i,
  /\blaravel\b/i,
  /\bpython\b/i,
  /\bdjango\b/i,
  /\bmysql\b/i,
  /\bsql\b/i,
  /\bfigma\b/i,
  /\bui\s*\/\s*ux\b/i,
  /\bwordpress\b/i,
  /\bshopify\b/i,
  /\btypescript\b/i,
  /\bjavascript\b/i,
  /\bpower ?bi\b/i,
  /\bexcel\b/i,
];

const DURATION_EVIDENCE_PATTERNS = [
  /\b\d+\s*(?:-|đến|toi|to)\s*\d*\s*(?:ngay|ngày|tuan|tuần|thang|tháng|week|weeks|month|months)\b/i,
  /\b\d+\s*(?:ngay|ngày|tuan|tuần|thang|tháng|week|weeks|month|months)\b/i,
];

const BUDGET_EVIDENCE_PATTERNS = [
  /\b\d+(?:[.,]\d+)?\s*(?:tr|triệu|trieu|k|nghìn|nghin|vnđ|vnd)\b/i,
  /\bthoa thuan\b/i,
  /\bkhong co dinh\b.*\btrao doi them\b/i,
  /\bkhong co ngan sach\b/i,
  /\bkhong ngan sach\b/i,
  /\bphu cap\b/i,
];

function normalizeJoinedText(parsedData: ParsedData, userMessages: string[]) {
  return normalizeText([parsedData.title, parsedData.description, parsedData.expectedOutput, ...userMessages].filter(Boolean).join(" "));
}

function normalizeBusinessContextText(parsedData: ParsedData, userMessages: string[]) {
  return normalizeText([parsedData.title, parsedData.description, ...userMessages].filter(Boolean).join(" "));
}

function normalizeUserMessageText(userMessages: string[]) {
  return normalizeText(userMessages.filter(Boolean).join(" "));
}

function hasPattern(text: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(text));
}

function hasSpaBusinessContext(text: string) {
  return /\bspa\b/i.test(text) && hasPattern(text, SPA_BUSINESS_CONTEXT_PATTERNS);
}

function scoreBusinessContext(parsedData: ParsedData, userMessages: string[]): SlotState {
  const text = normalizeBusinessContextText(parsedData, userMessages);
  if (!text) return "missing";

  return hasPattern(text, BUSINESS_CONTEXT_PATTERNS) || hasSpaBusinessContext(text) ? "complete" : "missing";
}

function scoreDeliverableScope(parsedData: ParsedData, userMessages: string[]): SlotState {
  const scopeEvidence = normalizeJoinedText(parsedData, userMessages);
  const hasArtifact = hasPattern(scopeEvidence, DELIVERABLE_ARTIFACT_PATTERNS);
  const hasBoundary = hasPattern(scopeEvidence, SCOPE_QUANTITY_PATTERNS);

  if (!hasArtifact && !hasBoundary) return "missing";
  if (hasArtifact && hasBoundary) return "complete";

  return "partial";
}

function scoreRequiredSkills(parsedData: ParsedData, userMessages: string[]): SlotState {
  const parsedSkills = normalizeText(parsedData.requiredSkills);
  if (parsedSkills && hasPattern(parsedSkills, SKILL_EVIDENCE_PATTERNS)) return "complete";

  const userMessageText = normalizeUserMessageText(userMessages);
  return userMessageText && hasPattern(userMessageText, SKILL_EVIDENCE_PATTERNS) ? "complete" : "missing";
}

function scoreTimelineBudget(parsedData: ParsedData, userMessages: string[]): SlotState {
  const userMessageText = normalizeUserMessageText(userMessages);
  const duration = normalizeText(parsedData.duration);
  const budget = normalizeText(parsedData.budget);
  const hasDurationEvidence = (duration && hasPattern(duration, DURATION_EVIDENCE_PATTERNS)) || hasPattern(userMessageText, DURATION_EVIDENCE_PATTERNS);
  const hasBudgetEvidence = (budget && hasPattern(budget, BUDGET_EVIDENCE_PATTERNS)) || hasPattern(userMessageText, BUDGET_EVIDENCE_PATTERNS);

  if (hasDurationEvidence && hasBudgetEvidence) return "complete";
  if (hasDurationEvidence || hasBudgetEvidence) return "partial";
  return "missing";
}

export function scoreCoverage(parsedData: ParsedData, userMessages: string[]): CoverageReport {
  return {
    businessContext: scoreBusinessContext(parsedData, userMessages),
    deliverableScope: scoreDeliverableScope(parsedData, userMessages),
    requiredSkills: scoreRequiredSkills(parsedData, userMessages),
    timelineBudget: scoreTimelineBudget(parsedData, userMessages),
  };
}

export function isCoverageComplete(coverage: CoverageReport) {
  return (Object.values(coverage) as SlotState[]).every((state) => state === "complete");
}

export function getNextSlot(coverage: CoverageReport): SlotKey | "completed" {
  const priority: SlotKey[] = ["businessContext", "deliverableScope", "requiredSkills", "timelineBudget"];

  for (const slot of priority) {
    if (coverage[slot] !== "complete") {
      return slot;
    }
  }

  return "completed";
}
