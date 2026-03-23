import { getUserMessages } from "./message-parser";
import { EMPTY_PARSED_DATA, type ChatMessageInput, type ParsedData, type ProjectProfile } from "./types";

const UNKNOWN_PATTERNS = [
  "chua ro",
  "can tu van",
  "khong ro",
  "khong biet",
  "goi y giup",
  "tu van giup",
  "de xuat giup",
  "dua vao yeu cau de de xuat",
];

const TECH_KEYWORDS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /\bwordpress\b/i, label: "WordPress" },
  { pattern: /\bwoo ?commerce\b/i, label: "WooCommerce" },
  { pattern: /\bshopify\b/i, label: "Shopify" },
  { pattern: /\bnext\.?js\b/i, label: "Next.js" },
  { pattern: /(^|\W)react(\W|$)/i, label: "React" },
  { pattern: /\bvue(\.js)?\b/i, label: "Vue.js" },
  { pattern: /\bnuxt\b/i, label: "Nuxt.js" },
  { pattern: /\bnode(\.js)?\b/i, label: "Node.js" },
  { pattern: /\bnest(\.js)?\b/i, label: "NestJS" },
  { pattern: /\bexpress\b/i, label: "Express.js" },
  { pattern: /\bphp\b/i, label: "PHP" },
  { pattern: /\blaravel\b/i, label: "Laravel" },
  { pattern: /\bpython\b/i, label: "Python" },
  { pattern: /\bdjango\b/i, label: "Django" },
  { pattern: /\bflask\b/i, label: "Flask" },
  { pattern: /\bflutter\b/i, label: "Flutter" },
  { pattern: /react native/i, label: "React Native" },
  { pattern: /\bkotlin\b/i, label: "Kotlin" },
  { pattern: /\bswift\b/i, label: "Swift" },
  { pattern: /\bfigma\b/i, label: "Figma" },
  { pattern: /ui ?\/ ?ux|ux ?ui/i, label: "UI/UX" },
  { pattern: /business analysis|phan tich yeu cau|\bba\b/i, label: "Business Analysis" },
  { pattern: /\bqa\b|kiem thu|testing/i, label: "QA/Testing" },
  { pattern: /\bsql\b/i, label: "SQL" },
  { pattern: /\bpower ?bi\b/i, label: "Power BI" },
  { pattern: /\bexcel\b/i, label: "Excel" },
  { pattern: /\bseo\b/i, label: "SEO" },
  { pattern: /content/i, label: "Content Marketing" },
  { pattern: /facebook ads/i, label: "Facebook Ads" },
  { pattern: /google ads/i, label: "Google Ads" },
  { pattern: /chatbot/i, label: "Chatbot" },
  { pattern: /\bn8n\b/i, label: "n8n" },
  { pattern: /automation|tu dong hoa/i, label: "Automation" },
];

const OUTPUT_KEYWORDS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /website ban hang|web ban hang/i, label: "Website bán hàng" },
  { pattern: /\blanding page\b/i, label: "Landing page" },
  { pattern: /\bwebsite\b|\bweb\b/i, label: "Website" },
  { pattern: /mobile app|ung dung di dong/i, label: "Ứng dụng di động" },
  { pattern: /web app|phan mem quan ly|ung dung quan ly/i, label: "Web app quản lý" },
  { pattern: /dashboard/i, label: "Dashboard" },
  { pattern: /bao cao/i, label: "Báo cáo" },
  { pattern: /chatbot/i, label: "Chatbot" },
  { pattern: /source code/i, label: "Source code" },
  { pattern: /tai lieu|document/i, label: "Tài liệu hướng dẫn" },
  { pattern: /\bdemo\b|prototype/i, label: "Demo/Prototype" },
  { pattern: /content plan|ke hoach noi dung/i, label: "Kế hoạch nội dung" },
];

function stripAccents(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

export function normalizeText(value: string) {
  return stripAccents(value).toLowerCase().replace(/\s+/g, " ").trim();
}

function dedupeStrings(values: string[]) {
  const seen = new Set<string>();
  return values.filter((value) => {
    const key = normalizeText(value);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function normalizeDifficulty(rawValue: string): ParsedData["difficulty"] {
  const normalized = normalizeText(rawValue);

  if (/\b(easy|de|don gian)\b/.test(normalized)) return "EASY";
  if (/\b(hard|kho|phuc tap)\b/.test(normalized)) return "HARD";
  if (/\b(medium|vua|trung binh)\b/.test(normalized)) return "MEDIUM";
  return "MEDIUM";
}

export function isAdviceRequest(value: string) {
  const normalized = normalizeText(value);
  if (!normalized) return false;
  return UNKNOWN_PATTERNS.some((pattern) => normalized.includes(pattern));
}

export function inferProjectProfile(userMessages: string[], title = "", description = ""): ProjectProfile {
  const text = normalizeText([title, description, ...userMessages].filter(Boolean).join(" "));

  if (/(ban hang|thuong mai dien tu|ecommerce|gio hang|don hang|san pham)/.test(text)) {
    return {
      category: "ecommerce",
      label: "website bán hàng",
      defaultTitle: "Website bán hàng cho doanh nghiệp",
      defaultGoal: "Xây dựng website bán hàng giúp doanh nghiệp giới thiệu sản phẩm và tiếp nhận đơn online.",
      platformHint: "Ưu tiên nền tảng web responsive; có thể chọn giải pháp no-code hoặc custom tùy ngân sách.",
      defaultOutput: "Website bán hàng",
      skillSuggestions: ["WordPress + WooCommerce", "Next.js + Node.js", "Shopify / no-code"],
      outputSuggestions: [
        "Website bán hàng 5 trang + giỏ hàng",
        "Landing page 1 trang + form liên hệ",
        "Website 5 trang + trang quản trị đơn hàng",
      ],
      durationSuggestions: ["2-3 tuần", "4-6 tuần", "6-8 tuần"],
      budgetSuggestions: ["3-5 triệu VNĐ", "5-10 triệu VNĐ", "Thỏa thuận theo phạm vi"],
    };
  }

  if (/(quan ly|noi bo|nhan su|kho|cong viec|crm|erp)/.test(text)) {
    return {
      category: "internal-tool",
      label: "ứng dụng quản lý nội bộ",
      defaultTitle: "Ứng dụng quản lý nội bộ",
      defaultGoal: "Số hoá quy trình nội bộ để theo dõi dữ liệu, thao tác và báo cáo nhanh hơn.",
      platformHint: "Ưu tiên web app nội bộ; có thể cân nhắc mobile nếu nhân sự dùng điện thoại thường xuyên.",
      defaultOutput: "Web app quản lý nội bộ",
      skillSuggestions: ["Business Analysis + UI/UX", "React/Next.js + Node.js", "PHP/Laravel + MySQL"],
      outputSuggestions: [
        "Web app 4 màn hình + 2 module chính",
        "Dashboard + phân quyền cho 2 vai trò",
        "Demo + source code cho 1 quy trình chính",
      ],
      durationSuggestions: ["3-4 tuần", "4-6 tuần", "6-8 tuần"],
      budgetSuggestions: ["5-8 triệu VNĐ", "8-15 triệu VNĐ", "Thỏa thuận theo module"],
    };
  }

  if (/(mobile app|ung dung di dong|android|ios|flutter|react native)/.test(text)) {
    return {
      category: "mobile-app",
      label: "ứng dụng di động",
      defaultTitle: "Ứng dụng di động cho doanh nghiệp",
      defaultGoal: "Xây dựng ứng dụng di động hỗ trợ thao tác và theo dõi dữ liệu mọi lúc.",
      platformHint: "Ưu tiên mobile app; có thể kèm thêm trang quản trị web nếu cần quản lý dữ liệu.",
      defaultOutput: "Ứng dụng di động",
      skillSuggestions: ["Flutter", "React Native", "UI/UX + API integration"],
      outputSuggestions: [
        "Ứng dụng 4 màn hình chính + API",
        "Demo app 4 màn hình + source code",
        "App + trang quản trị cho 1 luồng chính",
      ],
      durationSuggestions: ["4-6 tuần", "6-8 tuần", "8-10 tuần"],
      budgetSuggestions: ["8-12 triệu VNĐ", "12-20 triệu VNĐ", "Thỏa thuận theo tính năng"],
    };
  }

  if (/(chatbot|\bai\b|tu dong hoa|automation|n8n)/.test(text)) {
    return {
      category: "automation",
      label: "chatbot hoặc luồng tự động",
      defaultTitle: "Chatbot / luồng tự động cho doanh nghiệp",
      defaultGoal: "Tự động hoá thao tác lặp lại và hỗ trợ tư vấn cơ bản cho doanh nghiệp.",
      platformHint: "Có thể triển khai trên web, fanpage hoặc qua workflow automation tùy kênh sử dụng.",
      defaultOutput: "Chatbot hoặc workflow tự động",
      skillSuggestions: ["Chatbot design", "n8n / Automation", "Node.js + API integration"],
      outputSuggestions: [
        "Chatbot 1 kịch bản hỏi đáp + form thu lead",
        "Workflow 2 luồng tự động + tài liệu",
        "Demo + source code cho 1 quy trình chính",
      ],
      durationSuggestions: ["2-3 tuần", "3-5 tuần", "5-7 tuần"],
      budgetSuggestions: ["3-6 triệu VNĐ", "6-10 triệu VNĐ", "Thỏa thuận theo số luồng"],
    };
  }

  if (/(du lieu|bao cao|dashboard|phan tich|power bi|excel)/.test(text)) {
    return {
      category: "data",
      label: "dashboard hoặc bài toán dữ liệu",
      defaultTitle: "Dashboard / phân tích dữ liệu cho doanh nghiệp",
      defaultGoal: "Tổng hợp dữ liệu và trực quan hoá để doanh nghiệp ra quyết định nhanh hơn.",
      platformHint: "Có thể dùng dashboard web hoặc công cụ BI tùy nguồn dữ liệu hiện có.",
      defaultOutput: "Dashboard / báo cáo dữ liệu",
      skillSuggestions: ["SQL + Excel", "Power BI", "Python phân tích dữ liệu"],
      outputSuggestions: [
        "Dashboard 3 báo cáo chính",
        "Báo cáo phân tích cho 1 bộ dữ liệu",
        "Dashboard + tài liệu cho 2 nhóm chỉ số",
      ],
      durationSuggestions: ["2-3 tuần", "3-4 tuần", "4-6 tuần"],
      budgetSuggestions: ["2-4 triệu VNĐ", "4-8 triệu VNĐ", "Thỏa thuận theo số báo cáo"],
    };
  }

  if (/(content|fanpage|marketing|social|quang cao|seo)/.test(text)) {
    return {
      category: "marketing",
      label: "dự án marketing số",
      defaultTitle: "Dự án content / marketing số",
      defaultGoal: "Tạo nội dung và tài nguyên số giúp doanh nghiệp tiếp cận khách hàng tốt hơn.",
      platformHint: "Tùy mục tiêu có thể bàn giao bộ content, landing page hoặc tài nguyên truyền thông.",
      defaultOutput: "Bộ content marketing",
      skillSuggestions: ["Content Marketing", "Canva/Figma", "SEO / Facebook Ads"],
      outputSuggestions: [
        "Bộ content 12 bài/tháng",
        "Kế hoạch nội dung 1 tháng + template",
        "Landing page 1 trang + nội dung",
      ],
      durationSuggestions: ["1-2 tuần", "2-4 tuần", "1 tháng"],
      budgetSuggestions: ["1-3 triệu VNĐ", "3-5 triệu VNĐ", "Thỏa thuận theo khối lượng"],
    };
  }

  if (/(website|web|landing page)/.test(text)) {
    return {
      category: "website",
      label: "website doanh nghiệp",
      defaultTitle: "Website cho doanh nghiệp",
      defaultGoal: "Xây dựng website giới thiệu doanh nghiệp, sản phẩm hoặc dịch vụ một cách chuyên nghiệp.",
      platformHint: "Ưu tiên web responsive, tối ưu hiển thị trên mobile và desktop.",
      defaultOutput: "Website doanh nghiệp",
      skillSuggestions: ["WordPress", "Next.js / React", "UI/UX + Frontend"],
      outputSuggestions: [
        "Website doanh nghiệp 5 trang hoàn chỉnh",
        "Landing page 1 trang + form liên hệ",
        "Website 5 trang + trang quản trị nội dung",
      ],
      durationSuggestions: ["2-3 tuần", "3-5 tuần", "5-7 tuần"],
      budgetSuggestions: ["2-4 triệu VNĐ", "4-8 triệu VNĐ", "Thỏa thuận theo phạm vi"],
    };
  }

  return {
    category: "generic",
    label: "dự án số hoá",
    defaultTitle: "Dự án số hoá cho doanh nghiệp",
    defaultGoal: "Xây dựng giải pháp số phù hợp với nhu cầu vận hành hoặc kinh doanh của doanh nghiệp.",
    platformHint: "Cần xác nhận thêm web, app hay workflow tự động dựa trên nguồn lực triển khai.",
    defaultOutput: "Giải pháp số cho doanh nghiệp",
    skillSuggestions: ["Business Analysis", "UI/UX + Frontend", "Backend / Database"],
    outputSuggestions: [
      "Sản phẩm hoàn chỉnh cho 1 quy trình chính",
      "Demo + source code cho 1 module",
      "Tài liệu + hướng dẫn cho 1 luồng làm việc",
    ],
    durationSuggestions: ["2-3 tuần", "4-6 tuần", "6-8 tuần"],
    budgetSuggestions: ["2-5 triệu VNĐ", "5-10 triệu VNĐ", "Thỏa thuận"],
  };
}

function extractDistinctUserMessages(messages: ChatMessageInput[]) {
  return dedupeStrings(getUserMessages(messages));
}

function inferTitleFromMessages(userMessages: string[], profile: ProjectProfile) {
  if (userMessages.length === 0) return "";

  const meaningfulSeed = userMessages.find((message) => !isAdviceRequest(message)) ?? userMessages[0] ?? "";
  if (profile.category !== "generic") {
    return profile.defaultTitle;
  }

  const cleaned = meaningfulSeed.replace(/^l(am|àm)\s+/i, "").trim();
  if (!cleaned) return "";

  const shortTitle = cleaned.split(/\s+/).slice(0, 10).join(" ");
  return shortTitle.charAt(0).toUpperCase() + shortTitle.slice(1);
}

function buildDescriptionFromMessages(messages: ChatMessageInput[]) {
  const userMessages = extractDistinctUserMessages(messages);
  if (userMessages.length === 0) return "";
  return `Nhu cầu SME: ${userMessages.join(". ")}`;
}

function extractLabelsFromText(text: string, candidates: Array<{ pattern: RegExp; label: string }>) {
  return dedupeStrings(
    candidates.filter((candidate) => candidate.pattern.test(text)).map((candidate) => candidate.label),
  );
}

function extractRequiredSkillsFromMessages(messages: ChatMessageInput[]) {
  const joined = getUserMessages(messages).join(" ");
  const labels = extractLabelsFromText(joined, TECH_KEYWORDS);
  return labels.join(", ");
}

function extractExpectedOutputFromMessages(messages: ChatMessageInput[], profile: ProjectProfile) {
  const joined = getUserMessages(messages).join(" ");
  const labels = extractLabelsFromText(joined, OUTPUT_KEYWORDS);

  if (labels.length > 0) {
    return labels.join(", ");
  }

  const normalized = normalizeText(joined);
  if (profile.category !== "generic" && normalized) {
    return profile.defaultOutput;
  }

  return "";
}

function extractDurationFromMessages(messages: ChatMessageInput[]) {
  const joined = getUserMessages(messages).join(" ");
  const durationMatch = joined.match(/\b\d+\s*(?:-|đến|toi|to)\s*\d*\s*(ngày|ngay|tuần|tuan|tháng|thang)\b/i);
  if (durationMatch) {
    return durationMatch[0].replace(/\s+/g, " ").trim();
  }

  const simpleDurationMatch = joined.match(/\b\d+\s*(ngày|ngay|tuần|tuan|tháng|thang)\b/i);
  return simpleDurationMatch?.[0].replace(/\s+/g, " ").trim() ?? "";
}

function extractBudgetFromMessages(messages: ChatMessageInput[]) {
  const joined = getUserMessages(messages).join(" ");
  const normalized = normalizeText(joined);

  if (/\bthoa thuan\b/.test(normalized)) {
    return "Thỏa thuận";
  }

  if (/(khong co ngan sach|khong ngan sach|ho tro thuc tap|phu cap)/.test(normalized)) {
    return "Không cố định, trao đổi thêm";
  }

  const budgetMatch = joined.match(/\b\d+(?:[.,]\d+)?\s*(?:tr|triệu|trieu|k|nghìn|nghin|vnđ|vnd)\b/i);
  return budgetMatch?.[0].replace(/\s+/g, " ").trim() ?? "";
}

function inferDifficulty(parsedData: ParsedData) {
  const duration = normalizeText(parsedData.duration);
  const amount = Number(duration.match(/\d+/)?.[0] ?? "0");

  if (duration.includes("thang")) {
    if (amount >= 2) return "HARD";
    if (amount === 1) return "MEDIUM";
  }

  if (duration.includes("tuan")) {
    if (amount <= 2 && amount > 0) return "EASY";
    if (amount >= 6) return "HARD";
    if (amount >= 3) return "MEDIUM";
  }

  if (duration.includes("ngay")) {
    if (amount > 0 && amount <= 10) return "EASY";
  }

  return "MEDIUM";
}

function buildStandardizedBrief(parsedData: ParsedData, profile: ProjectProfile) {
  if (!parsedData.title && !parsedData.description) return "";

  const outputLine = parsedData.expectedOutput
    ? `${parsedData.expectedOutput}; ưu tiên bàn giao kèm source code và hướng dẫn sử dụng.`
    : `${profile.defaultOutput}; cần xác nhận thêm phạm vi bàn giao chi tiết.`;

  const skillLine = parsedData.requiredSkills
    ? parsedData.requiredSkills
    : "Chưa chốt công nghệ; cần xác nhận thêm stack hoặc nhóm kỹ năng phù hợp.";

  const platformLine = parsedData.requiredSkills
    ? `${profile.platformHint} Công nghệ ưu tiên: ${parsedData.requiredSkills}.`
    : `${profile.platformHint} Hiện chưa chốt stack cụ thể.`;

  return [
    `Mục tiêu: ${parsedData.title || profile.defaultGoal}.`,
    `Nền tảng sử dụng: ${platformLine}`,
    `Đầu ra cần bàn giao: ${outputLine}`,
    `Yêu cầu kỹ năng: ${skillLine}.`,
  ].join("\n");
}

export function buildFallbackParsedData(messages: ChatMessageInput[]): ParsedData {
  const distinctUserMessages = extractDistinctUserMessages(messages);
  const profile = inferProjectProfile(distinctUserMessages);
  const title = inferTitleFromMessages(distinctUserMessages, profile);
  const description = buildDescriptionFromMessages(messages);
  const expectedOutput = extractExpectedOutputFromMessages(messages, profile);
  const requiredSkills = extractRequiredSkillsFromMessages(messages);
  const duration = extractDurationFromMessages(messages);
  const budget = extractBudgetFromMessages(messages);

  const parsedData: ParsedData = {
    ...EMPTY_PARSED_DATA,
    title,
    description,
    expectedOutput,
    requiredSkills,
    duration,
    budget,
    difficulty: "MEDIUM",
  };

  parsedData.difficulty = inferDifficulty(parsedData);
  parsedData.standardizedBrief = buildStandardizedBrief(parsedData, profile);

  return parsedData;
}

export function rebuildStandardizedBrief(parsedData: ParsedData, messages: ChatMessageInput[]) {
  const profile = inferProjectProfile(getUserMessages(messages), parsedData.title, parsedData.description);
  return buildStandardizedBrief(parsedData, profile);
}
