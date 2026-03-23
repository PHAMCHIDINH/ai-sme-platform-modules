import { describe, expect, it } from "vitest";
import { actionFailure, actionSuccess, hasActionError } from "@/modules/shared";

describe("action-result", () => {
  it("creates success payload", () => {
    expect(actionSuccess()).toEqual({ success: true });
  });

  it("creates failure payload", () => {
    expect(actionFailure("Không hợp lệ")).toEqual({ error: "Không hợp lệ" });
  });

  it("detects action error payload", () => {
    expect(hasActionError(actionFailure("Lỗi"))).toBe(true);
    expect(hasActionError(actionSuccess())).toBe(false);
  });
});
