export function describeMatchScore(
  score: number,
  options?: { hasSignal?: boolean },
) {
  if (options?.hasSignal === false) {
    return {
      label: "Chưa đủ dữ liệu",
      tone: "neutral",
      helper: "Cần thêm dữ liệu đầu vào để xếp hạng chính xác.",
    } as const;
  }

  if (score >= 80) {
    return {
      label: "Rất phù hợp",
      tone: "strong",
      helper: "Bạn đã khá sát với nhu cầu thực tế.",
    } as const;
  }

  if (score >= 60) {
    return {
      label: "Tiềm năng cao",
      tone: "medium",
      helper: "Phù hợp để ứng tuyển và hoàn thiện thêm đầu ra.",
    } as const;
  }

  return {
    label: "Cần bù kỹ năng",
    tone: "weak",
    helper: "Nên xem đây là cơ hội học hỏi có định hướng.",
  } as const;
}
