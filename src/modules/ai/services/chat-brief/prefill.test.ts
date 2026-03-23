import { describe, expect, it } from "vitest";

import type { ProjectFormInput } from "@/modules/project";
import { buildProjectFormPrefillPatch } from "./prefill";

const baseFormValues: ProjectFormInput = {
  title: "",
  description: "",
  standardizedBrief: "",
  expectedOutput: "",
  requiredSkills: "",
  difficulty: "MEDIUM",
  duration: "",
  budget: "",
};

describe("chat brief prefill", () => {
  it("fills only empty, non-dirty fields", () => {
    const patch = buildProjectFormPrefillPatch({
      parsedData: {
        title: "Nền tảng quản lý kho",
        expectedOutput: "Web dashboard",
        requiredSkills: "React, Node.js",
      },
      currentValues: {
        ...baseFormValues,
        requiredSkills: "TypeScript",
      },
      dirtyFields: {},
    });

    expect(patch).toEqual({
      title: "Nền tảng quản lý kho",
      expectedOutput: "Web dashboard",
    });
  });

  it("does not overwrite dirty field even when parsed value exists", () => {
    const patch = buildProjectFormPrefillPatch({
      parsedData: {
        title: "AI chatbot",
        duration: "4 tuần",
      },
      currentValues: {
        ...baseFormValues,
        title: "Portal tuyển dụng",
      },
      dirtyFields: {
        title: true,
      },
    });

    expect(patch).toEqual({
      duration: "4 tuần",
    });
  });

  it("ignores null-like and invalid difficulty", () => {
    const patch = buildProjectFormPrefillPatch({
      parsedData: {
        budget: "null",
        duration: " ",
        difficulty: "EXPERT",
      },
      currentValues: baseFormValues,
      dirtyFields: {},
    });

    expect(patch).toEqual({});
  });

  it("accepts valid difficulty when user has not edited difficulty", () => {
    const patch = buildProjectFormPrefillPatch({
      parsedData: {
        difficulty: "HARD",
      },
      currentValues: baseFormValues,
      dirtyFields: {},
    });

    expect(patch).toEqual({
      difficulty: "HARD",
    });
  });

  it("does not update difficulty when difficulty field is dirty", () => {
    const patch = buildProjectFormPrefillPatch({
      parsedData: {
        difficulty: "EASY",
      },
      currentValues: {
        ...baseFormValues,
        difficulty: "HARD",
      },
      dirtyFields: {
        difficulty: true,
      },
    });

    expect(patch).toEqual({});
  });
});
