import { describe, expect, it } from "vitest";

import {
  buildProjectEmbeddingInput,
  buildStudentEmbeddingInput,
  normalizeBackfillLimit,
} from "./embedding-backfill";

describe("embedding backfill helpers", () => {
  it("normalizes limit into a safe range", () => {
    expect(normalizeBackfillLimit(undefined)).toBe(50);
    expect(normalizeBackfillLimit(-5)).toBe(1);
    expect(normalizeBackfillLimit(999)).toBe(200);
    expect(normalizeBackfillLimit(24)).toBe(24);
  });

  it("builds student embedding input from meaningful fields", () => {
    const text = buildStudentEmbeddingInput({
      major: "Computer Science",
      skills: ["Problem Solving", ""],
      technologies: ["React", "Node.js"],
      interests: ["Fintech", "AI"],
      description: "Interested in real SME projects",
    });

    expect(text).toContain("Computer Science");
    expect(text).toContain("React");
    expect(text).toContain("Fintech");
    expect(text).toContain("Interested in real SME projects");
  });

  it("builds project embedding input from brief fields", () => {
    const text = buildProjectEmbeddingInput({
      title: "CRM Automation",
      description: "Improve lead handling",
      standardizedBrief: "Build workflow automations",
      expectedOutput: "A production-ready MVP",
      requiredSkills: ["React", "PostgreSQL"],
      difficulty: "MEDIUM",
      duration: "8 weeks",
    });

    expect(text).toContain("CRM Automation");
    expect(text).toContain("workflow automations");
    expect(text).toContain("production-ready MVP");
    expect(text).toContain("MEDIUM");
  });
});
