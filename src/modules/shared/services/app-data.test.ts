import { describe, expect, it } from "vitest";
import {
  buildStudentDiscoveryProjectSelect,
  buildStudentDiscoveryVisibilityWhere,
  normalizeStudentDiscoveryProject,
} from "./app-data";

describe("student discovery query helpers", () => {
  it("builds the open-only visibility filter for anonymous discovery", () => {
    expect(buildStudentDiscoveryVisibilityWhere(null)).toEqual({
      OR: [{ status: "OPEN" }],
    });
  });

  it("adds the student application visibility branch when a student id is present", () => {
    expect(buildStudentDiscoveryVisibilityWhere("student-1")).toEqual({
      OR: [
        { status: "OPEN" },
        {
          applications: {
            some: {
              studentId: "student-1",
            },
          },
        },
      ],
    });
  });

  it("keeps the discovery select lean for anonymous callers", () => {
    expect(buildStudentDiscoveryProjectSelect(null)).toEqual({
      id: true,
      title: true,
      description: true,
      standardizedBrief: true,
      expectedOutput: true,
      requiredSkills: true,
      duration: true,
      budget: true,
      difficulty: true,
      status: true,
      deadline: true,
      createdAt: true,
      embedding: true,
      _count: {
        select: {
          applications: true,
        },
      },
      sme: {
        select: {
          companyName: true,
          avatarUrl: true,
          industry: true,
          description: true,
        },
      },
    });
  });

  it("includes the student application slice when a student id is present", () => {
    expect(buildStudentDiscoveryProjectSelect("student-1")).toEqual({
      id: true,
      title: true,
      description: true,
      standardizedBrief: true,
      expectedOutput: true,
      requiredSkills: true,
      duration: true,
      budget: true,
      difficulty: true,
      status: true,
      deadline: true,
      createdAt: true,
      embedding: true,
      _count: {
        select: {
          applications: true,
        },
      },
      sme: {
        select: {
          companyName: true,
          avatarUrl: true,
          industry: true,
          description: true,
        },
      },
      applications: {
        where: {
          studentId: "student-1",
        },
        select: {
          status: true,
          initiatedBy: true,
        },
        take: 1,
      },
    });
  });

  it("normalizes discovery rows to always expose an applications array", () => {
    expect(
      normalizeStudentDiscoveryProject({
        id: "project-1",
        title: "Landing page",
        description: "Xây dựng landing page",
        standardizedBrief: null,
        expectedOutput: "Website",
        requiredSkills: ["Next.js"],
        duration: "3 tuần",
        budget: null,
        difficulty: "MEDIUM",
        status: "OPEN",
        deadline: null,
        createdAt: new Date("2026-03-20T00:00:00.000Z"),
        embedding: [],
        sme: {
          companyName: "ABC SME",
          avatarUrl: null,
          industry: "Retail",
          description: "Mô tả",
        },
        _count: { applications: 6 },
      }),
    ).toEqual({
      id: "project-1",
      title: "Landing page",
      description: "Xây dựng landing page",
      standardizedBrief: null,
      expectedOutput: "Website",
      requiredSkills: ["Next.js"],
      duration: "3 tuần",
      budget: null,
      difficulty: "MEDIUM",
      status: "OPEN",
      deadline: null,
      createdAt: new Date("2026-03-20T00:00:00.000Z"),
      embedding: [],
      sme: {
        companyName: "ABC SME",
        avatarUrl: null,
        industry: "Retail",
        description: "Mô tả",
      },
      _count: { applications: 6 },
      applications: [],
    });
  });
});
