import { describe, expect, it } from "vitest";

import { EMPTY_PARSED_DATA, type CoverageReport } from "./types";
import { planNextQuestion } from "./question-planner";

const COMPLETE_COVERAGE: CoverageReport = {
  businessContext: "complete",
  deliverableScope: "complete",
  requiredSkills: "complete",
  timelineBudget: "complete",
};

describe("question planner", () => {
  it("asks business context first with domain quick picks", () => {
    const plan = planNextQuestion({
      coverage: {
        ...COMPLETE_COVERAGE,
        businessContext: "missing",
      },
      profileLabel: "dự án marketing số",
      parsedData: EMPTY_PARSED_DATA,
    });

    expect(plan.nextSlot).toBe("businessContext");
    expect(plan.message.toLowerCase()).toContain("kinh doanh");
    expect(plan.suggestions.length).toBeGreaterThanOrEqual(3);
    expect(plan.suggestions).toContain("Spa mỹ phẩm / clinic làm đẹp");
  });

  it("returns timeline/budget quick-pick suggestions when timelineBudget incomplete", () => {
    const plan = planNextQuestion({
      coverage: {
        ...COMPLETE_COVERAGE,
        timelineBudget: "partial",
      },
      profileLabel: "website bán hàng",
      parsedData: EMPTY_PARSED_DATA,
    });

    expect(plan.nextSlot).toBe("timelineBudget");
    expect(plan.message.toLowerCase()).toContain("thời gian");
    expect(plan.suggestions.length).toBeGreaterThanOrEqual(3);
    expect(plan.suggestions.length).toBeLessThanOrEqual(4);
  });
});
