import { describe, expect, it } from "vitest";
import { smeProfileSchema } from "./sme-profile";

const basePayload = {
  companyName: "ABC Tech",
  industry: "SaaS",
  companySize: "11-50",
  description: "Mô tả công ty",
};

describe("smeProfileSchema", () => {
  it("rejects invalid avatarUrl", () => {
    const parsed = smeProfileSchema.safeParse({
      ...basePayload,
      avatarUrl: "abc",
    });

    expect(parsed.success).toBe(false);
  });

  it("accepts valid avatarUrl", () => {
    const parsed = smeProfileSchema.safeParse({
      ...basePayload,
      avatarUrl: "https://example.com/company.png",
    });

    expect(parsed.success).toBe(true);
  });

  it("accepts empty avatarUrl", () => {
    const parsed = smeProfileSchema.safeParse({
      ...basePayload,
      avatarUrl: "",
    });

    expect(parsed.success).toBe(true);
  });
});
