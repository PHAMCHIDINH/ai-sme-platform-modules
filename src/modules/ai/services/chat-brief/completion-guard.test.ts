import { describe, expect, it } from "vitest";

import { CLARIFYING_MESSAGE, guardCompletion } from "./completion-guard";

describe("completion guard", () => {
  it("blocks completion message when coverage is incomplete", () => {
    const result = guardCompletion({
      coverage: {
        businessContext: "complete",
        deliverableScope: "partial",
        requiredSkills: "complete",
        timelineBudget: "missing",
      },
      message: "Mình thấy đã đủ rồi, mình đăng dự án nhé?",
    });

    expect(result.isReadyToSubmit).toBe(false);
    expect(result.message).toBe(CLARIFYING_MESSAGE);
  });

  it("does not rewrite a neutral incomplete message", () => {
    const result = guardCompletion({
      coverage: {
        businessContext: "complete",
        deliverableScope: "partial",
        requiredSkills: "complete",
        timelineBudget: "missing",
      },
      message: "Mình cần hỏi thêm phần thời gian và ngân sách.",
    });

    expect(result.isReadyToSubmit).toBe(false);
    expect(result.message).toBe("Mình cần hỏi thêm phần thời gian và ngân sách.");
  });

  it("rewrites a likely bypass phrase when coverage is incomplete", () => {
    const result = guardCompletion({
      coverage: {
        businessContext: "complete",
        deliverableScope: "partial",
        requiredSkills: "complete",
        timelineBudget: "missing",
      },
      message: "Mình có thể đăng bài luôn không?",
    });

    expect(result.isReadyToSubmit).toBe(false);
    expect(result.message).toBe(CLARIFYING_MESSAGE);
  });

  it("blocks submit phrasing when coverage is incomplete", () => {
    const result = guardCompletion({
      coverage: {
        businessContext: "complete",
        deliverableScope: "partial",
        requiredSkills: "complete",
        timelineBudget: "missing",
      },
      message: "Mình submit dự án được chưa?",
    });

    expect(result.isReadyToSubmit).toBe(false);
    expect(result.message).toBe(CLARIFYING_MESSAGE);
  });

  it("blocks đủ thông tin phrasing when coverage is incomplete", () => {
    const result = guardCompletion({
      coverage: {
        businessContext: "complete",
        deliverableScope: "partial",
        requiredSkills: "complete",
        timelineBudget: "missing",
      },
      message: "Mình đã đủ thông tin để chốt rồi.",
    });

    expect(result.isReadyToSubmit).toBe(false);
    expect(result.message).toBe(CLARIFYING_MESSAGE);
  });

  it("blocks co the dang du an phrasing when coverage is incomplete", () => {
    const result = guardCompletion({
      coverage: {
        businessContext: "complete",
        deliverableScope: "partial",
        requiredSkills: "complete",
        timelineBudget: "missing",
      },
      message: "Mình có thể đăng dự án luôn không?",
    });

    expect(result.isReadyToSubmit).toBe(false);
    expect(result.message).toBe(CLARIFYING_MESSAGE);
  });

  it("allows completion when all slots complete", () => {
    const result = guardCompletion({
      coverage: {
        businessContext: "complete",
        deliverableScope: "complete",
        requiredSkills: "complete",
        timelineBudget: "complete",
      },
      message: "Mình đã đủ thông tin, mình đăng dự án nhé!",
    });

    expect(result.isReadyToSubmit).toBe(true);
    expect(result.message).toBe("Mình đã đủ thông tin, mình đăng dự án nhé!");
  });
});
