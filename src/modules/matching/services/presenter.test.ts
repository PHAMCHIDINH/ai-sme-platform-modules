import { describe, expect, it } from "vitest";
import { describeMatchScore } from "@/modules/matching";

describe("matching presenter", () => {
  it("maps a score of 80 to the strongest fit band", () => {
    expect(describeMatchScore(80)).toMatchObject({
      label: "Rất phù hợp",
      tone: "strong",
      helper: "Bạn đã khá sát với nhu cầu thực tế.",
    });
  });

  it("maps a score of 60 to the medium fit band", () => {
    expect(describeMatchScore(60)).toMatchObject({
      label: "Tiềm năng cao",
      tone: "medium",
      helper: "Phù hợp để ứng tuyển và hoàn thiện thêm đầu ra.",
    });
  });

  it("maps scores below 60 to an improvement-oriented band", () => {
    expect(describeMatchScore(42)).toMatchObject({
      label: "Cần bù kỹ năng",
      tone: "weak",
      helper: "Nên xem đây là cơ hội học hỏi có định hướng.",
    });
  });

  it("marks missing signal as unscored instead of weak", () => {
    expect(describeMatchScore(0, { hasSignal: false })).toMatchObject({
      label: "Chưa đủ dữ liệu",
      tone: "neutral",
      helper: "Cần thêm dữ liệu đầu vào để xếp hạng chính xác.",
    });
  });
});
