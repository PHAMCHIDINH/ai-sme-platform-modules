import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMocks = vi.hoisted(() => ({
  project: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
  },
}));

vi.mock("../kernel/prisma", () => ({
  prisma: prismaMocks,
}));

import {
  findStudentDiscoveryProjectById,
  listStudentDiscoveryProjects,
} from "./app-data";

describe("student discovery query wrappers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("applies open-only visibility and normalizes anonymous list results", async () => {
    prismaMocks.project.findMany.mockResolvedValueOnce([
      {
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
      },
    ]);

    const projects = await listStudentDiscoveryProjects(null);

    expect(prismaMocks.project.findMany).toHaveBeenCalledWith({
      where: {
        OR: [{ status: "OPEN" }],
      },
      orderBy: { createdAt: "desc" },
      select: {
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
      },
    });
    expect(projects).toEqual([
      {
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
      },
    ]);
  });

  it("includes the student branch and normalized application slice for authenticated discovery", async () => {
    prismaMocks.project.findMany.mockResolvedValueOnce([
      {
        id: "project-2",
        title: "CRM mini app",
        description: "Xây dựng CRM",
        standardizedBrief: null,
        expectedOutput: "Web app",
        requiredSkills: ["Next.js"],
        duration: "4 tuần",
        budget: null,
        difficulty: "MEDIUM",
        status: "OPEN",
        deadline: null,
        createdAt: new Date("2026-03-21T00:00:00.000Z"),
        embedding: [],
        sme: {
          companyName: "XYZ SME",
          avatarUrl: "https://example.com/xyz.png",
          industry: "Retail",
          description: "Mô tả",
        },
        applications: [{ status: "PENDING", initiatedBy: "STUDENT" }],
        _count: { applications: 2 },
      },
    ]);

    const projects = await listStudentDiscoveryProjects("student-1");

    expect(prismaMocks.project.findMany).toHaveBeenCalledWith({
      where: {
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
      },
      orderBy: { createdAt: "desc" },
      select: {
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
          where: { studentId: "student-1" },
          select: {
            status: true,
            initiatedBy: true,
          },
          take: 1,
        },
      },
    });
    expect(projects).toEqual([
      {
        id: "project-2",
        title: "CRM mini app",
        description: "Xây dựng CRM",
        standardizedBrief: null,
        expectedOutput: "Web app",
        requiredSkills: ["Next.js"],
        duration: "4 tuần",
        budget: null,
        difficulty: "MEDIUM",
        status: "OPEN",
        deadline: null,
        createdAt: new Date("2026-03-21T00:00:00.000Z"),
        embedding: [],
        sme: {
          companyName: "XYZ SME",
          avatarUrl: "https://example.com/xyz.png",
          industry: "Retail",
          description: "Mô tả",
        },
        applications: [{ status: "PENDING", initiatedBy: "STUDENT" }],
        _count: { applications: 2 },
      },
    ]);
  });

  it("normalizes find-by-id results through the wrapper", async () => {
    prismaMocks.project.findFirst.mockResolvedValueOnce({
      id: "project-3",
      title: "Landing page chi tiết",
      description: "Xây dựng landing page giới thiệu sản phẩm",
      standardizedBrief: null,
      expectedOutput: "Website",
      requiredSkills: ["Next.js"],
      duration: "3 tuần",
      budget: null,
      difficulty: "MEDIUM",
      status: "OPEN",
      deadline: null,
      createdAt: new Date("2026-03-22T00:00:00.000Z"),
      embedding: [],
      sme: {
        companyName: "ABC SME",
        avatarUrl: null,
        industry: "Retail",
        description: "Mô tả",
      },
      _count: { applications: 4 },
    });

    const project = await findStudentDiscoveryProjectById("project-3", null);

    expect(prismaMocks.project.findFirst).toHaveBeenCalledWith({
      where: {
        id: "project-3",
        OR: [{ status: "OPEN" }],
      },
      select: {
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
      },
    });
    expect(project).toEqual({
      id: "project-3",
      title: "Landing page chi tiết",
      description: "Xây dựng landing page giới thiệu sản phẩm",
      standardizedBrief: null,
      expectedOutput: "Website",
      requiredSkills: ["Next.js"],
      duration: "3 tuần",
      budget: null,
      difficulty: "MEDIUM",
      status: "OPEN",
      deadline: null,
      createdAt: new Date("2026-03-22T00:00:00.000Z"),
      embedding: [],
      sme: {
        companyName: "ABC SME",
        avatarUrl: null,
        industry: "Retail",
        description: "Mô tả",
      },
      _count: { applications: 4 },
      applications: [],
    });
  });
});
