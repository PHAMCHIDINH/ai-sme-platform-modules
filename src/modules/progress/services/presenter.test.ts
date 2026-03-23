import { describe, expect, it } from "vitest";

import {
  progressStatusBarClassName,
  progressStatusClassName,
  progressStatusLabel,
} from "./presenter";

describe("progress presenter", () => {
  it("returns status labels and classes", () => {
    expect(progressStatusLabel("COMPLETED")).toBe("Hoàn thành");
    expect(progressStatusLabel("SUBMITTED")).toBe("Đã bàn giao");
    expect(progressStatusClassName("SUBMITTED")).toContain("amber");
    expect(progressStatusBarClassName("SUBMITTED")).toBe("bg-amber-500");
  });
});
