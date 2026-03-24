import { describe, expect, it } from "vitest";
import { studentProfileSchema } from "./student-profile";

const basePayload = {
  university: "ĐH Bách Khoa",
  major: "Khoa học máy tính",
  skills: "React, TypeScript",
  technologies: "Next.js, Prisma",
  githubUrl: "",
  portfolioUrl: "",
  availability: "20h/tuần",
  description: "Mô tả ngắn",
  interests: "EdTech",
};

describe("studentProfileSchema", () => {
  it("rejects invalid avatarUrl", () => {
    const parsed = studentProfileSchema.safeParse({
      ...basePayload,
      avatarUrl: "abc",
    });

    expect(parsed.success).toBe(false);
  });

  it("accepts valid avatarUrl", () => {
    const parsed = studentProfileSchema.safeParse({
      ...basePayload,
      avatarUrl: "https://example.com/avatar.png",
    });

    expect(parsed.success).toBe(true);
  });
});
