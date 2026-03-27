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
        description: "Xây dựng landing page giới thiệu sản phẩm",
        standardizedBrief: null,
        expectedOutput: "Website landing page",
        requiredSkills: ["Next.js"],
        duration: "3 tuần",
        budget: null,
        difficulty: "MEDIUM",
        status: "OPEN",
        deadline: new Date("2026-04-01T00:00:00.000Z"),
        createdAt: new Date("2026-03-20T00:00:00.000Z"),
        embedding: [],
        sme: { companyName: "ABC SME", avatarUrl: null, industry: "Retail", description: "Mô tả doanh nghiệp" },
        applications: [{ status: "REJECTED", initiatedBy: "STUDENT" }],
        _count: { applications: 1 },
      },
      { hasStudentProfile: true, matchScore: 72 },
    );

    expect(summary.interactionState).toBe("REJECTED");
  });

  it("passes through company avatar url when present", async () => {
    const projectModule = await import("@/modules/project");

    const detail = projectModule.presentStudentProjectDetail(
      {
        id: "project-2",
        title: "CRM mini app",
        description: "Nội dung",
        standardizedBrief: null,
        expectedOutput: "Web app",
        requiredSkills: ["Next.js"],
        duration: "4 tuần",
        budget: null,
        difficulty: "MEDIUM",
        status: "OPEN",
        deadline: new Date("2026-04-15T00:00:00.000Z"),
        createdAt: new Date("2026-03-21T00:00:00.000Z"),
        embedding: [],
        sme: {
          companyName: "XYZ SME",
          industry: "Retail",
          description: "Mô tả",
          avatarUrl: "https://example.com/sme-avatar.png",
        },
        applications: [],
        _count: { applications: 0 },
      },
      { hasStudentProfile: true, matchScore: 55 },
    );

    expect(detail.companyAvatarUrl).toBe("https://example.com/sme-avatar.png");
  });
});
