import { describe, expect, it } from "vitest";

import { EMPTY_PARSED_DATA } from "./types";
import { getNextSlot, isCoverageComplete, scoreCoverage } from "./slot-coverage";

describe("chat brief slot coverage", () => {
  it("marks all slots missing for empty parsed data", () => {
    const coverage = scoreCoverage(EMPTY_PARSED_DATA, []);

    expect(coverage).toEqual({
      businessContext: "missing",
      deliverableScope: "missing",
      requiredSkills: "missing",
      timelineBudget: "missing",
    });
    expect(isCoverageComplete(coverage)).toBe(false);
    expect(getNextSlot(coverage)).toBe("businessContext");
  });

  it("marks timelineBudget as partial when only duration exists", () => {
    const coverage = scoreCoverage(
      {
        ...EMPTY_PARSED_DATA,
        duration: "4 tuần",
      },
      [],
    );

    expect(coverage.timelineBudget).toBe("partial");
    expect(coverage.businessContext).toBe("missing");
    expect(coverage.deliverableScope).toBe("missing");
    expect(coverage.requiredSkills).toBe("missing");
    expect(getNextSlot(coverage)).toBe("businessContext");
  });

  it("does not count expected output as business context evidence", () => {
    const coverage = scoreCoverage(
      {
        ...EMPTY_PARSED_DATA,
        expectedOutput: "Web app quản lý kho cho doanh nghiệp logistics SME.",
      },
      [],
    );

    expect(coverage.businessContext).toBe("missing");
    expect(coverage.deliverableScope).toBe("partial");
    expect(getNextSlot(coverage)).toBe("businessContext");
  });

  it("keeps deliverableScope partial when expected output is generic", () => {
    const coverage = scoreCoverage(
      {
        ...EMPTY_PARSED_DATA,
        expectedOutput: "web app",
      },
      [],
    );

    expect(coverage.deliverableScope).toBe("partial");
  });

  it("infers deliverableScope from conversation evidence when expected output is empty", () => {
    const coverage = scoreCoverage(
      {
        ...EMPTY_PARSED_DATA,
        description: "Cần xây dựng web app quản lý kho cho doanh nghiệp logistics, gồm 4 màn hình và 2 module chính.",
      },
      ["Mình muốn có website nội bộ cho nhóm vận hành, kèm source code và dashboard báo cáo."],
    );

    expect(coverage.deliverableScope).toBe("complete");
  });

  it("keeps businessContext missing for verb-only descriptions", () => {
    const coverage = scoreCoverage(
      {
        ...EMPTY_PARSED_DATA,
        description: "Cần xây dựng website giới thiệu.",
      },
      [],
    );

    expect(coverage.businessContext).toBe("missing");
  });

  it("keeps businessContext missing for internal-context non-business descriptions", () => {
    const coverage = scoreCoverage(
      {
        ...EMPTY_PARSED_DATA,
        description: "website nội bộ cho câu lạc bộ sinh viên",
      },
      [],
    );

    expect(coverage.businessContext).toBe("missing");
  });

  it("scores businessContext complete for valid SME domain phrases", () => {
    const coverage = scoreCoverage(
      {
        ...EMPTY_PARSED_DATA,
        description: "Cần website cho thương hiệu mỹ phẩm.",
      },
      [],
    );

    expect(coverage.businessContext).toBe("complete");
  });

  it("scores businessContext complete from title-only business clues", () => {
    const coverage = scoreCoverage(
      {
        ...EMPTY_PARSED_DATA,
        title: "Nền tảng quản lý kho cho doanh nghiệp logistics SME",
      },
      [],
    );

    expect(coverage.businessContext).toBe("complete");
  });

  it("does not mark fallback-like generic SME wording as business context evidence", () => {
    const coverage = scoreCoverage(
      {
        ...EMPTY_PARSED_DATA,
        description: "Nhu cầu SME: giải pháp số phù hợp với nhu cầu vận hành hoặc kinh doanh.",
      },
      [],
    );

    expect(coverage.businessContext).toBe("missing");
  });

  it("scores requiredSkills from user messages when parsed field is empty", () => {
    const coverage = scoreCoverage(
      {
        ...EMPTY_PARSED_DATA,
      },
      ["Ưu tiên React, Node.js và MySQL cho dự án này."],
    );

    expect(coverage.requiredSkills).toBe("complete");
  });

  it("does not mark requiredSkills complete for placeholder text", () => {
    const coverage = scoreCoverage(
      {
        ...EMPTY_PARSED_DATA,
        requiredSkills: "công nghệ phù hợp",
      },
      [],
    );

    expect(coverage.requiredSkills).toBe("missing");
  });

  it("scores timelineBudget from user messages when parsed fields are empty", () => {
    const coverage = scoreCoverage(
      {
        ...EMPTY_PARSED_DATA,
      },
      ["Dự án khoảng 4 tuần, ngân sách 10 triệu VNĐ."],
    );

    expect(coverage.timelineBudget).toBe("complete");
  });

  it("treats thoa thuan budget text as budget evidence", () => {
    const coverage = scoreCoverage(
      {
        ...EMPTY_PARSED_DATA,
        duration: "4 tuần",
        budget: "Thỏa thuận",
      },
      [],
    );

    expect(coverage.timelineBudget).toBe("complete");
  });

  it("does not mark timelineBudget complete for placeholder values", () => {
    const coverage = scoreCoverage(
      {
        ...EMPTY_PARSED_DATA,
        duration: "cần trao đổi thêm",
        budget: "chưa rõ",
      },
      [],
    );

    expect(coverage.timelineBudget).toBe("missing");
  });

  it("scores marketing deliverables complete when content artifact and cadence evidence exist", () => {
    const coverage = scoreCoverage(
      {
        ...EMPTY_PARSED_DATA,
        description: "Cần bộ content fanpage cho thương hiệu thời trang trẻ.",
      },
      ["Mỗi tháng cần 12 bài/tháng và 4 story/tuần."],
    );

    expect(coverage.deliverableScope).toBe("complete");
  });

  it("detects ung dung wording as deliverable evidence even without boundary details", () => {
    const coverage = scoreCoverage(
      {
        ...EMPTY_PARSED_DATA,
        description: "Cần xây dựng ứng dụng quản lý cho bộ phận vận hành.",
      },
      [],
    );

    expect(coverage.deliverableScope).toBe("partial");
  });

  it("does not treat technical SPA as business context evidence", () => {
    const coverage = scoreCoverage(
      {
        ...EMPTY_PARSED_DATA,
        description: "Cần xây dựng SPA bằng React và TypeScript cho hệ thống nội bộ.",
      },
      [],
    );

    expect(coverage.businessContext).toBe("missing");
  });

  it("marks all slots complete when enough evidence exists", () => {
    const coverage = scoreCoverage(
      {
        ...EMPTY_PARSED_DATA,
        description: "Cần xây dựng nền tảng quản lý kho cho doanh nghiệp logistics SME để theo dõi hàng tồn và vận hành nội bộ.",
        expectedOutput: "Web app quản lý kho với dashboard, phân quyền và báo cáo tồn kho.",
        requiredSkills: "React, Node.js, MySQL",
        duration: "6 tuần",
        budget: "12 triệu VNĐ",
      },
      ["Mình cần làm cho doanh nghiệp logistics nhỏ, ưu tiên web nội bộ, gồm 4 màn hình và 2 module chính."],
    );

    expect(coverage).toEqual({
      businessContext: "complete",
      deliverableScope: "complete",
      requiredSkills: "complete",
      timelineBudget: "complete",
    });
    expect(isCoverageComplete(coverage)).toBe(true);
    expect(getNextSlot(coverage)).toBe("completed");
  });
});
