import type { CoverageReport, ParsedData, SlotKey } from "./types";

export type PlannerInput = {
  coverage: CoverageReport;
  profileLabel: string;
  parsedData?: ParsedData;
};

export type PlannerOutput = {
  nextSlot: SlotKey | "completed";
  message: string;
  suggestions: string[];
};

const SLOT_PRIORITY: SlotKey[] = ["businessContext", "deliverableScope", "requiredSkills", "timelineBudget"];

const TIMELINE_BUDGET_SUGGESTIONS = [
  "2-4 tuần, 3-5 triệu",
  "4-6 tuần, 5-10 triệu",
  "6-8 tuần, 10-15 triệu",
  "Trao đổi theo phạm vi",
];

const DELIVERABLE_SCOPE_SUGGESTIONS = [
  "Landing page 1 trang + form liên hệ",
  "1 module hoặc 1 tính năng chính",
  "Prototype 1 luồng chính trước",
];

const REQUIRED_SKILLS_SUGGESTIONS = [
  "React, Node.js",
  "WordPress, UI/UX",
  "Python, API Integration",
];

const DEFAULT_BUSINESS_CONTEXT_SUGGESTIONS = [
  "Cửa hàng / shop bán lẻ",
  "Công ty dịch vụ / agency nhỏ",
  "Thương hiệu địa phương muốn tăng khách",
];

function buildBusinessContextSuggestions(profileLabel: string) {
  const normalized = profileLabel.trim().toLowerCase();

  if (normalized.includes("marketing")) {
    return [
      "Spa mỹ phẩm / clinic làm đẹp",
      "Cửa hàng thời trang / phụ kiện",
      "Quán cafe / nhà hàng địa phương",
    ];
  }

  if (normalized.includes("website") || normalized.includes("bán hàng")) {
    return [
      "Shop mỹ phẩm / thời trang",
      "Công ty dịch vụ cần website giới thiệu",
      "Cửa hàng địa phương muốn bán online",
    ];
  }

  if (normalized.includes("nội bộ") || normalized.includes("quản lý")) {
    return [
      "Công ty có đội sale / vận hành",
      "Kho / logistics quy mô nhỏ",
      "Cửa hàng nhiều đơn mỗi ngày",
    ];
  }

  if (normalized.includes("dữ liệu") || normalized.includes("dashboard")) {
    return [
      "Cửa hàng cần xem doanh số / tồn kho",
      "Doanh nghiệp dịch vụ cần theo dõi KPI",
      "Công ty nhỏ muốn tổng hợp báo cáo nhanh",
    ];
  }

  if (normalized.includes("chatbot") || normalized.includes("tự động")) {
    return [
      "Shop online cần trả lời khách nhanh",
      "Spa / clinic muốn tư vấn cơ bản tự động",
      "Công ty dịch vụ muốn giảm việc lặp lại",
    ];
  }

  return DEFAULT_BUSINESS_CONTEXT_SUGGESTIONS;
}

function resolveNextSlot(coverage: CoverageReport): SlotKey | "completed" {
  for (const slot of SLOT_PRIORITY) {
    if (coverage[slot] !== "complete") return slot;
  }
  return "completed";
}

function formatProfileLabel(profileLabel: string) {
  const trimmed = profileLabel.trim();
  return trimmed || "dự án này";
}

function buildMessage(nextSlot: SlotKey | "completed", profileLabel: string) {
  const label = formatProfileLabel(profileLabel);

  switch (nextSlot) {
    case "businessContext":
      return `Doanh nghiệp của bạn đang kinh doanh gì hoặc phục vụ nhóm khách nào cho ${label}?`;
    case "deliverableScope":
      return `Bạn muốn bàn giao cụ thể những gì cho ${label}?`;
    case "requiredSkills":
      return `Bạn muốn ưu tiên kỹ năng nào cho ${label}?`;
    case "timelineBudget":
      return `Bạn muốn chốt thời gian và ngân sách cho ${label} theo phương án nào?`;
    default:
      return "Thông tin đã đủ, mình có thể chốt tiếp.";
  }
}

function buildSuggestions(nextSlot: SlotKey | "completed", profileLabel: string) {
  if (nextSlot === "businessContext") return buildBusinessContextSuggestions(profileLabel);
  if (nextSlot === "timelineBudget") return TIMELINE_BUDGET_SUGGESTIONS;
  if (nextSlot === "deliverableScope") return DELIVERABLE_SCOPE_SUGGESTIONS;
  if (nextSlot === "requiredSkills") return REQUIRED_SKILLS_SUGGESTIONS;
  return [];
}

export function planNextQuestion(input: PlannerInput): PlannerOutput {
  const nextSlot = resolveNextSlot(input.coverage);

  return {
    nextSlot,
    message: buildMessage(nextSlot, input.profileLabel),
    suggestions: buildSuggestions(nextSlot, input.profileLabel),
  };
}
