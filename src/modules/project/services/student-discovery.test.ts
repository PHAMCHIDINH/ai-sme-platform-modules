import { describe, expect, it } from "vitest";
import {
  deriveStudentProjectInteractionState,
  presentStudentProjectSummary,
} from "@/modules/project";

describe("student discovery presenter", () => {
  it("exports a state derivation helper", async () => {
    const projectModule = await import("@/modules/project");

    expect(typeof (projectModule as Record<string, unknown>).deriveStudentProjectInteractionState).toBe("function");
  });

  it("exports a summary presenter helper", async () => {
    const projectModule = await import("@/modules/project");

    expect(typeof (projectModule as Record<string, unknown>).presentStudentProjectSummary).toBe("function");
  });

  it("marks profile-required when the student lacks a profile", () => {
    expect(
      deriveStudentProjectInteractionState({
        hasStudentProfile: false,
        projectStatus: "OPEN",
        application: null,
      }),
    ).toBe("PROFILE_REQUIRED");
  });

  it("marks pending when a student application already exists", () => {
    expect(
      deriveStudentProjectInteractionState({
        hasStudentProfile: true,
        projectStatus: "OPEN",
        application: { status: "PENDING", initiatedBy: "STUDENT" },
      }),
    ).toBe("PENDING");
  });

  it("marks closed projects as non-actionable", () => {
    expect(
      deriveStudentProjectInteractionState({
        hasStudentProfile: true,
        projectStatus: "COMPLETED",
        application: null,
      }),
    ).toBe("PROJECT_CLOSED");
  });

  it("preserves accepted state even after the project leaves OPEN", () => {
    expect(
      deriveStudentProjectInteractionState({
        hasStudentProfile: true,
        projectStatus: "IN_PROGRESS",
        application: { status: "ACCEPTED", initiatedBy: "SME" },
      }),
    ).toBe("ACCEPTED");
  });

  it("exports a detail presenter helper", async () => {
    const projectModule = await import("@/modules/project");

    expect(typeof (projectModule as Record<string, unknown>).presentStudentProjectDetail).toBe("function");
  });

  it("derives summary state from an existing rejected application", () => {
    const summary = presentStudentProjectSummary(
      {
        id: "project-1",
        title: "Landing page cho SME",
        expectedOutput: "Website landing page",
        requiredSkills: ["Next.js"],
        duration: "3 tuần",
        embedding: [],
        sme: { companyName: "ABC SME" },
        applications: [{ status: "REJECTED", initiatedBy: "STUDENT" }],
      },
      { hasStudentProfile: true, matchScore: 72 },
    );

    expect(summary.interactionState).toBe("REJECTED");
  });
});
