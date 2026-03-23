import { afterEach, describe, expect, it, vi } from "vitest";

import { CHAT_BRIEF_SYSTEM_PROMPT } from "./prompt-builder";
import { inferProjectProfile } from "./profile-inference";
import { buildDeterministicResponse } from "./response-normalizer";
import {
  EMPTY_PARSED_DATA,
  getNextField,
  normalizeResponse,
  type ChatMessageInput,
} from "./response-normalizer";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unmock("@/auth");
  vi.unmock("@/modules/ai");
  vi.resetModules();
});

describe("chat-brief modules", () => {
  it("infers ecommerce profile from selling website intent", () => {
    const profile = inferProjectProfile(["Cần làm website bán hàng cho SME"]);
    expect(profile.category).toBe("ecommerce");
    expect(profile.defaultOutput).toContain("Website");
  });

  it("does not misclassify marketing content briefs as automation because of the word bai", () => {
    const profile = inferProjectProfile([
      "Cần làm dự án content marketing cho fanpage spa mỹ phẩm",
      "Bàn giao bộ content 12 bài/tháng với template đăng bài",
    ]);

    expect(profile.category).toBe("marketing");
  });

  it("returns requiredSkills as next field when missing", () => {
    expect(getNextField(EMPTY_PARSED_DATA)).toBe("requiredSkills");
  });

  it("normalizes unknown payload into fallback parsed data", () => {
    const messages: ChatMessageInput[] = [
      { role: "user", content: "Mình cần website bán hàng cho shop nhỏ" },
    ];

    const response = normalizeResponse({}, messages);

    expect(response.parsedData.title.length).toBeGreaterThan(0);
    expect(Array.isArray(response.suggestions)).toBe(true);
    expect(response.message.length).toBeGreaterThan(0);
    expect(response.coverage).toBeDefined();
    expect(response.nextSlot).toBeDefined();
    expect(typeof response.isReadyToSubmit).toBe("boolean");
  });

  it("does not set ready state when timelineBudget incomplete", () => {
    const messages: ChatMessageInput[] = [
      { role: "user", content: "Cần làm website cho shop mỹ phẩm với 5 trang chính" },
      { role: "user", content: "Ưu tiên WordPress" },
      { role: "user", content: "Thời gian khoảng 4 tuần" },
    ];

    const response = normalizeResponse(
      {
        parsedData: {
          title: "Website cho shop mỹ phẩm",
          expectedOutput: "Website doanh nghiệp hoàn chỉnh",
          requiredSkills: "WordPress",
          duration: "4 tuần",
        },
      },
      messages,
    );

    expect(response.coverage.timelineBudget).toBe("partial");
    expect(response.nextSlot).toBe("timelineBudget");
    expect(response.isReadyToSubmit).toBe(false);
  });

  it("uses profile-aware requiredSkills suggestions for a marketing project", () => {
    const messages: ChatMessageInput[] = [
      { role: "user", content: "Cần làm dự án content marketing cho fanpage spa mỹ phẩm" },
      { role: "user", content: "Mục tiêu là tăng inbox và khách đặt lịch từ fanpage spa mỹ phẩm" },
      { role: "user", content: "Bàn giao bộ content 12 bài/tháng với template đăng bài" },
      { role: "user", content: "Thời gian 2 tuần, ngân sách 3 triệu" },
    ];

    const response = normalizeResponse(
      {
        parsedData: {
          title: "Dự án content marketing cho spa mỹ phẩm",
          description: "Spa mỹ phẩm muốn tăng inbox và khách đặt lịch từ fanpage",
          expectedOutput: "Bộ content 12 bài/tháng và template đăng bài",
          duration: "2 tuần",
          budget: "3 triệu",
        },
      },
      messages,
    );

    expect(response.nextSlot).toBe("requiredSkills");
    expect(response.suggestions).toEqual(["Content Marketing", "Canva/Figma", "SEO / Facebook Ads"]);
  });

  it("returns quick-pick suggestions when business context is still missing", () => {
    const messages: ChatMessageInput[] = [
      { role: "user", content: "Viết content fanpage" },
    ];

    const response = normalizeResponse({}, messages);

    expect(response.nextSlot).toBe("businessContext");
    expect(response.suggestions.length).toBeGreaterThanOrEqual(3);
    expect(response.suggestions).toContain("Spa mỹ phẩm / clinic làm đẹp");
  });

  it("moves to the next slot after user picks a business context suggestion", () => {
    const messages: ChatMessageInput[] = [
      { role: "user", content: "Viết content fanpage" },
      { role: "user", content: "Spa mỹ phẩm / clinic làm đẹp" },
    ];

    const response = normalizeResponse({}, messages);

    expect(response.nextSlot).toBe("deliverableScope");
  });

  it("moves to requiredSkills after user picks a concrete deliverable suggestion", () => {
    const messages: ChatMessageInput[] = [
      { role: "user", content: "Xây dựng Web bán hàng" },
      { role: "user", content: "Shop mỹ phẩm / thời trang" },
      { role: "user", content: "Landing page 1 trang + form liên hệ" },
    ];

    const response = normalizeResponse({}, messages);

    expect(response.nextSlot).toBe("requiredSkills");
  });

  it("offers concrete website deliverable quick picks with clear scope", () => {
    const messages: ChatMessageInput[] = [
      { role: "user", content: "Xây dựng Web bán hàng" },
      { role: "user", content: "Shop mỹ phẩm / thời trang" },
    ];

    const response = normalizeResponse({}, messages);

    expect(response.nextSlot).toBe("deliverableScope");
    expect(response.suggestions.some((suggestion) => /\b\d+\s*(trang|module|màn hình)\b/i.test(suggestion))).toBe(true);
  });

  it("returns parsable timelineBudget suggestions", () => {
    const messages: ChatMessageInput[] = [
      { role: "user", content: "Cần làm website bán hàng cho shop nhỏ với 5 trang chính" },
      { role: "user", content: "Ưu tiên WordPress" },
      { role: "user", content: "Bàn giao website hoàn chỉnh" },
    ];

    const response = normalizeResponse(
      {
        parsedData: {
          title: "Website bán hàng cho shop nhỏ",
          expectedOutput: "Website bán hàng hoàn chỉnh",
          requiredSkills: "WordPress",
        },
      },
      messages,
    );

    expect(response.nextSlot).toBe("timelineBudget");
    expect(response.suggestions.length).toBeGreaterThan(0);
    expect(response.suggestions.every((suggestion) => /\d+\s*(tuần|tháng|ngày)/i.test(suggestion))).toBe(true);
    expect(response.suggestions.every((suggestion) => /(\d+(?:[.,]\d+)?\s*(tr|triệu|k|vnđ|vnd))|thỏa thuận/i.test(suggestion))).toBe(true);
  });

  it("sets ready state only when required groups complete", () => {
    const messages: ChatMessageInput[] = [
      { role: "user", content: "Cần website cho shop mỹ phẩm với 5 trang chính" },
      { role: "user", content: "Dùng WordPress, bàn giao source code" },
      { role: "user", content: "Thời gian 4 tuần, ngân sách 5 triệu" },
    ];

    const response = normalizeResponse(
      {
        parsedData: {
          title: "Website cho shop mỹ phẩm",
          expectedOutput: "Website doanh nghiệp hoàn chỉnh, source code",
          requiredSkills: "WordPress",
          duration: "4 tuần",
          budget: "5 triệu",
        },
      },
      messages,
    );

    expect(Object.values(response.coverage)).toEqual(["complete", "complete", "complete", "complete"]);
    expect(response.nextSlot).toBe("completed");
    expect(response.isReadyToSubmit).toBe(true);
  });

  it("keeps system prompt constraints", () => {
    expect(CHAT_BRIEF_SYSTEM_PROMPT).toContain("JSON object");
    expect(CHAT_BRIEF_SYSTEM_PROMPT).toContain("parsedData");
  });
});

describe("chat-brief route contract", () => {
  it("preserves parsed context when required facts fall outside the bounded history window", async () => {
    const contextParsedData = {
      title: "Website cho shop mỹ phẩm",
      description: "Cửa hàng mỹ phẩm cần website bán hàng với 5 trang chính",
      standardizedBrief: "Bối cảnh: shop mỹ phẩm cần kênh bán hàng online. Mục tiêu: ra mắt website 5 trang. Đầu ra: source code hoàn chỉnh. Ràng buộc: WordPress, 4 tuần, 5 triệu.",
      expectedOutput: "Website bán hàng hoàn chỉnh, source code",
      requiredSkills: "WordPress, UI/UX",
      difficulty: "MEDIUM" as const,
      duration: "4 tuần",
      budget: "5 triệu",
    };
    const fullHistory = [
      { role: "user", content: "Shop mỹ phẩm của mình cần làm website bán hàng." },
      { role: "assistant", content: "Bạn cần bàn giao những gì?" },
      { role: "user", content: "Website hoàn chỉnh với 5 trang chính và source code." },
      { role: "assistant", content: "Cần kỹ năng gì và timeline/budget thế nào?" },
      ...Array.from({ length: 16 }, (_, index) => ({
        role: index % 2 === 0 ? "user" : "assistant",
        content: index % 2 === 0 ? `Mình xác nhận lại bước ${index + 1}.` : `Đã ghi nhận bước ${index + 1}.`,
      })),
    ];
    const boundedHistory = fullHistory.slice(-16);
    const buildOfflineResponse = vi.fn().mockReturnValue({
      message: "offline partial",
      parsedData: {
        title: "",
        description: "",
        standardizedBrief: "",
        expectedOutput: "",
        requiredSkills: "",
        difficulty: "MEDIUM" as const,
        duration: "",
        budget: "",
      },
    });

    vi.doMock("@/auth", () => ({
      auth: vi.fn().mockResolvedValue({ user: { id: "u-1" } }),
    }));
    vi.doMock("@/modules/ai", () => ({
      chatModelStr: "test-model",
      openaiInstance: null,
      CHAT_BRIEF_SYSTEM_PROMPT: "system prompt",
      buildOfflineResponse,
      normalizeAIResponseContent: vi.fn(),
      parseIncomingMessages: vi.fn().mockReturnValue(fullHistory),
      toAIChatMessages: vi.fn(),
    }));

    const { POST } = await import("@/app/api/ai/chat-brief/route");
    const response = await POST(
      new Request("http://localhost/api/ai/chat-brief", {
        method: "POST",
        body: JSON.stringify({
          messages: fullHistory,
          context: { parsedData: contextParsedData },
        }),
      }),
    );
    const json = await response.json();
    const expected = buildDeterministicResponse(contextParsedData, boundedHistory);

    expect(buildOfflineResponse).toHaveBeenCalledWith(boundedHistory);
    expect(json.parsedData).toEqual(contextParsedData);
    expect(json.coverage).toEqual(expected.coverage);
    expect(json.nextSlot).toBe(expected.nextSlot);
    expect(json.isReadyToSubmit).toBe(true);
    expect(json.message).toBe(expected.message);
  });

  it("bounds offline history to the last 16 messages before deterministic fallback", async () => {
    const preservedParsedData = {
      title: "Website cho shop mỹ phẩm",
      description: "Cửa hàng mỹ phẩm muốn ra mắt website bán hàng 5 trang chính",
      standardizedBrief: "",
      expectedOutput: "Website bán hàng hoàn chỉnh, source code",
      requiredSkills: "WordPress, UI/UX",
      difficulty: "MEDIUM" as const,
      duration: "4 tuần",
      budget: "5 triệu",
    };
    const fullHistory = Array.from({ length: 20 }, (_, index) => ({
      role: index % 2 === 0 ? "user" : "assistant",
      content: `message-${index + 1}`,
    }));
    const boundedHistory = fullHistory.slice(-16);
    const buildOfflineResponse = vi.fn().mockReturnValue({
      message: "offline partial",
      suggestions: ["A"],
      parsedData: preservedParsedData,
    });

    vi.doMock("@/auth", () => ({
      auth: vi.fn().mockResolvedValue({ user: { id: "u-1" } }),
    }));
    vi.doMock("@/modules/ai", () => ({
      chatModelStr: "test-model",
      openaiInstance: null,
      CHAT_BRIEF_SYSTEM_PROMPT: "system prompt",
      buildOfflineResponse,
      normalizeAIResponseContent: vi.fn(),
      parseIncomingMessages: vi.fn().mockReturnValue(fullHistory),
      toAIChatMessages: vi.fn(),
    }));

    const { POST } = await import("@/app/api/ai/chat-brief/route");
    const response = await POST(
      new Request("http://localhost/api/ai/chat-brief", {
        method: "POST",
        body: JSON.stringify({ messages: fullHistory }),
      }),
    );
    const json = await response.json();
    const expected = buildDeterministicResponse(preservedParsedData, boundedHistory);

    expect(buildOfflineResponse).toHaveBeenCalledWith(boundedHistory);
    expect(json.parsedData).toEqual(preservedParsedData);
    expect(json.message).toBe(expected.message);
    expect(json.suggestions).toEqual(expected.suggestions);
    expect(json.coverage).toEqual(expected.coverage);
    expect(json.nextSlot).toBe(expected.nextSlot);
    expect(json.isReadyToSubmit).toBe(expected.isReadyToSubmit);
  });

  it("backfills enriched fields on the offline path", async () => {
    const preservedParsedData = {
      title: "Website cho shop mỹ phẩm",
      description: "Cửa hàng mỹ phẩm muốn ra mắt website bán hàng 5 trang chính",
      standardizedBrief: "",
      expectedOutput: "Website bán hàng hoàn chỉnh, source code",
      requiredSkills: "WordPress, UI/UX",
      difficulty: "MEDIUM" as const,
      duration: "4 tuần",
      budget: "5 triệu",
    };

    vi.doMock("@/auth", () => ({
      auth: vi.fn().mockResolvedValue({ user: { id: "u-1" } }),
    }));
    vi.doMock("@/modules/ai", () => ({
      chatModelStr: "test-model",
      openaiInstance: null,
      CHAT_BRIEF_SYSTEM_PROMPT: "system prompt",
      buildOfflineResponse: vi.fn().mockReturnValue({
        message: "offline partial",
        suggestions: ["A"],
        parsedData: preservedParsedData,
      }),
      normalizeAIResponseContent: vi.fn(),
      parseIncomingMessages: vi.fn().mockReturnValue([{ role: "user", content: "Cần website bán hàng cho shop nhỏ" }]),
      toAIChatMessages: vi.fn(),
    }));

    const { POST } = await import("@/app/api/ai/chat-brief/route");
    const response = await POST(
      new Request("http://localhost/api/ai/chat-brief", {
        method: "POST",
        body: JSON.stringify({ messages: [{ role: "user", content: "Cần website bán hàng cho shop nhỏ" }] }),
      }),
    );
    const json = await response.json();
    const expected = buildDeterministicResponse(preservedParsedData, [
      { role: "user", content: "Cần website bán hàng cho shop nhỏ" },
    ]);

    expect(json.parsedData).toEqual(preservedParsedData);
    expect(json.message).toBe(expected.message);
    expect(json.suggestions).toEqual(expected.suggestions);
    expect(json.coverage).toEqual(expected.coverage);
    expect(json.nextSlot).toBe(expected.nextSlot);
    expect(json.isReadyToSubmit).toBe(expected.isReadyToSubmit);
  });

  it("backfills enriched fields on the online path", async () => {
    const preservedParsedData = {
      title: "App quản lý kho cho cửa hàng SME",
      description: "Cần hệ thống theo dõi tồn kho, nhập xuất và báo cáo 5 màn hình",
      standardizedBrief: "",
      expectedOutput: "Web app quản lý kho, dashboard, API",
      requiredSkills: "React, Node.js",
      difficulty: "MEDIUM" as const,
      duration: "6 tuần",
      budget: "10 triệu",
    };

    vi.doMock("@/auth", () => ({
      auth: vi.fn().mockResolvedValue({ user: { id: "u-1" } }),
    }));
    vi.doMock("@/modules/ai", () => ({
      chatModelStr: "test-model",
      openaiInstance: {
        chat: {
          completions: {
            create: vi.fn().mockResolvedValue({
              choices: [{ message: { content: "{\"message\":\"online partial\"}" } }],
            }),
          },
        },
      },
      CHAT_BRIEF_SYSTEM_PROMPT: "system prompt",
      buildOfflineResponse: vi.fn(),
      normalizeAIResponseContent: vi.fn().mockReturnValue({
        message: "online partial",
        parsedData: preservedParsedData,
      }),
      parseIncomingMessages: vi.fn().mockReturnValue([{ role: "user", content: "Cần app quản lý kho" }]),
      toAIChatMessages: vi.fn().mockReturnValue([{ role: "user", content: "Cần app quản lý kho" }]),
    }));

    const { POST } = await import("@/app/api/ai/chat-brief/route");
    const response = await POST(
      new Request("http://localhost/api/ai/chat-brief", {
        method: "POST",
        body: JSON.stringify({ messages: [{ role: "user", content: "Cần app quản lý kho" }] }),
      }),
    );
    const json = await response.json();
    const expected = buildDeterministicResponse(preservedParsedData, [
      { role: "user", content: "Cần app quản lý kho" },
    ]);

    expect(json.parsedData).toEqual(preservedParsedData);
    expect(json.message).toBe(expected.message);
    expect(json.suggestions).toEqual(expected.suggestions);
    expect(json.coverage).toEqual(expected.coverage);
    expect(json.nextSlot).toBe(expected.nextSlot);
    expect(json.isReadyToSubmit).toBe(expected.isReadyToSubmit);
  });

  it("bounds online history to the last 16 messages before ai handoff", async () => {
    const preservedParsedData = {
      title: "App quản lý kho cho cửa hàng SME",
      description: "Cần hệ thống theo dõi tồn kho, nhập xuất và báo cáo 5 màn hình",
      standardizedBrief: "",
      expectedOutput: "Web app quản lý kho, dashboard, API",
      requiredSkills: "React, Node.js",
      difficulty: "MEDIUM" as const,
      duration: "6 tuần",
      budget: "10 triệu",
    };
    const fullHistory = Array.from({ length: 20 }, (_, index) => ({
      role: index % 2 === 0 ? "user" : "assistant",
      content: `message-${index + 1}`,
    }));
    const boundedHistory = fullHistory.slice(-16);
    const aiMessages = boundedHistory.map((message) => ({
      role: message.role === "assistant" ? "assistant" : "user",
      content: message.content,
    }));
    const create = vi.fn().mockResolvedValue({
      choices: [{ message: { content: "{\"message\":\"online partial\"}" } }],
    });
    const toAIChatMessages = vi.fn().mockReturnValue(aiMessages);
    const normalizeAIResponseContent = vi.fn().mockReturnValue({
      message: "online partial",
      parsedData: preservedParsedData,
    });

    vi.doMock("@/auth", () => ({
      auth: vi.fn().mockResolvedValue({ user: { id: "u-1" } }),
    }));
    vi.doMock("@/modules/ai", () => ({
      chatModelStr: "test-model",
      openaiInstance: {
        chat: {
          completions: {
            create,
          },
        },
      },
      CHAT_BRIEF_SYSTEM_PROMPT: "system prompt",
      buildOfflineResponse: vi.fn(),
      normalizeAIResponseContent,
      parseIncomingMessages: vi.fn().mockReturnValue(fullHistory),
      toAIChatMessages,
    }));

    const { POST } = await import("@/app/api/ai/chat-brief/route");
    const response = await POST(
      new Request("http://localhost/api/ai/chat-brief", {
        method: "POST",
        body: JSON.stringify({ messages: fullHistory }),
      }),
    );
    const json = await response.json();
    const expected = buildDeterministicResponse(preservedParsedData, boundedHistory);

    expect(toAIChatMessages).toHaveBeenCalledWith(boundedHistory);
    expect(create).toHaveBeenCalledWith({
      model: "test-model",
      messages: [{ role: "system", content: "system prompt" }, ...aiMessages],
      response_format: { type: "json_object" },
      temperature: 0.25,
      max_tokens: 800,
    });
    expect(normalizeAIResponseContent).toHaveBeenCalledWith("{\"message\":\"online partial\"}", boundedHistory);
    expect(json.parsedData).toEqual(preservedParsedData);
    expect(json.message).toBe(expected.message);
    expect(json.suggestions).toEqual(expected.suggestions);
    expect(json.coverage).toEqual(expected.coverage);
    expect(json.nextSlot).toBe(expected.nextSlot);
    expect(json.isReadyToSubmit).toBe(expected.isReadyToSubmit);
  });
});
