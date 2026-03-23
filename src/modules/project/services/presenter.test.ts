import { describe, expect, it } from "vitest";

import { projectStatusClassName, projectStatusLabel } from "@/modules/project";

describe("project presenter", () => {
  it("maps project status label in Vietnamese consistently", () => {
    expect(projectStatusLabel("OPEN")).toBe("Đang mở");
    expect(projectStatusLabel("IN_PROGRESS")).toBe("Đang tiến hành");
    expect(projectStatusLabel("SUBMITTED")).toBe("Chờ nghiệm thu");
    expect(projectStatusLabel("COMPLETED")).toBe("Hoàn thành");
    expect(projectStatusLabel("DRAFT")).toBe("Nháp");
  });

  it("maps project status style class consistently", () => {
    expect(projectStatusClassName("OPEN")).toBe("border-indigo-500 text-indigo-600");
    expect(projectStatusClassName("IN_PROGRESS")).toBe("border-blue-500 text-blue-600");
    expect(projectStatusClassName("SUBMITTED")).toBe("border-amber-500 text-amber-600");
    expect(projectStatusClassName("COMPLETED")).toBe("border-green-500 text-green-600");
    expect(projectStatusClassName("DRAFT")).toBe("border-gray-400 text-gray-500");
  });
});
