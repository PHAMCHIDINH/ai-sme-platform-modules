import { describe, expect, it } from "vitest";
import {
  type StudentProjectDetailRaw,
  presentStudentProjectDetail,
} from "@/modules/project/services/student-project-detail";

describe("student project detail presenter", () => {
  const detailContractFixture = {
    id: "project-1",
    title: "Landing page cho SME",
    description: "Xây dựng landing page giới thiệu sản phẩm",
    standardizedBrief: "Chuẩn hóa brief",
    expectedOutput: "A responsive marketing site",
    requiredSkills: ["Next.js", "Tailwind CSS"],
    duration: "3 tuần",
    budget: "12,000,000 VND",
    difficulty: "MEDIUM",
    status: "OPEN",
    deadline: new Date("2026-04-01T00:00:00.000Z"),
    createdAt: new Date("2026-03-20T00:00:00.000Z"),
    embedding: [],
    sme: {
      companyName: "ABC SME",
      avatarUrl: "https://example.com/abc.png",
      industry: "Retail",
      description: "Nhãn hàng bán lẻ đang mở rộng kênh online",
    },
    applications: [],
    _count: { applications: 8 },
  } satisfies StudentProjectDetailRaw;

  it("hardens the raw contract with typed discovery fields", () => {
    const detail = presentStudentProjectDetail(detailContractFixture, {
      hasStudentProfile: true,
      matchScore: 82,
    });

    expect(detail.deadline).toEqual(new Date("2026-04-01T00:00:00.000Z"));
    expect(detail.createdAt).toEqual(new Date("2026-03-20T00:00:00.000Z"));
    expect(detail.applicationCount).toBe(8);
  });

  it("keeps open projects actionable for students with a profile", () => {
    const openProject = {
      ...detailContractFixture,
      status: "OPEN",
      applications: [],
    } satisfies StudentProjectDetailRaw;

    const detail = presentStudentProjectDetail(openProject, {
      hasStudentProfile: true,
      matchScore: 82,
    });

    expect(detail.interactionState).toBe("READY_TO_APPLY");
  });
});
