import { describe, expect, it } from "vitest";
import {
  applyStudentProjectFilters,
  normalizeStudentProjectFilters,
} from "./student-project-filters";

function makeProject(overrides: Partial<Parameters<typeof applyStudentProjectFilters>[0][number]> = {}) {
  return {
    id: "project-1",
    title: "Landing page cho SME",
    description: "Xây dựng landing page giới thiệu sản phẩm",
    standardizedBrief: null,
    expectedOutput: "Website landing page",
    requiredSkills: ["Next.js", "Tailwind CSS"],
    duration: "3 tuần",
    budget: null,
    difficulty: "MEDIUM" as const,
    status: "OPEN" as const,
    deadline: new Date("2026-04-01T00:00:00.000Z"),
    createdAt: new Date("2026-03-20T00:00:00.000Z"),
    embedding: [],
    sme: {
      companyName: "ABC SME",
      avatarUrl: null,
      industry: "Retail",
      description: "Mô tả doanh nghiệp",
    },
    applications: [],
    _count: { applications: 0 },
    matchScore: 75,
    ...overrides,
  };
}

describe("student project filters", () => {
  it("normalizes search params by trimming values, dropping invalid filters, and defaulting sort", () => {
    expect(
      normalizeStudentProjectFilters({
        q: ["  CRM dashboard  ", "ignored"],
        difficulty: ["", "hard", "easy"],
        sort: ["oldest"],
      }),
    ).toEqual({
      q: "CRM dashboard",
      difficulty: "HARD",
      sort: "oldest",
    });
  });

  it("filters by search term and difficulty, then sorts newest first", () => {
    const projects = [
      makeProject({
        id: "project-1",
        title: "Landing page cho SME",
        difficulty: "MEDIUM",
        createdAt: new Date("2026-03-20T00:00:00.000Z"),
        matchScore: 40,
      }),
      makeProject({
        id: "project-2",
        title: "CRM dashboard",
        description: "Dashboard theo dõi lead và pipeline",
        requiredSkills: ["React", "PostgreSQL"],
        difficulty: "HARD",
        createdAt: new Date("2026-03-21T00:00:00.000Z"),
        matchScore: 90,
      }),
      makeProject({
        id: "project-3",
        title: "Admin dashboard",
        description: "Bộ công cụ quản trị nội dung",
        requiredSkills: ["Next.js", "Prisma"],
        difficulty: "HARD",
        createdAt: new Date("2026-03-19T00:00:00.000Z"),
        matchScore: 60,
      }),
    ];

    const results = applyStudentProjectFilters(projects, {
      q: "dashboard",
      difficulty: "HARD",
      sort: "newest",
    });

    expect(results.map((project) => project.id)).toEqual(["project-2", "project-3"]);
  });
});
