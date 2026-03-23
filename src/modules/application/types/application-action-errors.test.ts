import { describe, expect, it } from "vitest";

import { applicationActionErrorMessage } from "./application-action-errors";

describe("application action error messages", () => {
  it("maps error code to user-friendly message", () => {
    expect(applicationActionErrorMessage("PROJECT_NOT_RECRUITING")).toBe("Dự án không còn tuyển người.");
    expect(applicationActionErrorMessage("UNAUTHORIZED")).toContain("không có quyền");
  });
});
