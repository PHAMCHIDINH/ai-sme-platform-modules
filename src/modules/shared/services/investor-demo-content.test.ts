import { describe, expect, it } from "vitest";
import { investorDemoContent } from "@/modules/shared";

describe("investor demo content", () => {
  it("includes demo and impact CTAs in hero", () => {
    expect(investorDemoContent.hero.ctas.map((item) => item.href)).toEqual([
      "/#demo-flow",
      "/impact",
    ]);
  });

  it("defines four impact metrics", () => {
    expect(investorDemoContent.impact.metrics).toHaveLength(4);
  });
});
