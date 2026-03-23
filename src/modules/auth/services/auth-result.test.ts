import { describe, expect, it } from "vitest";

import { getAuthActionErrorMessage } from "./auth-result";

describe("getAuthActionErrorMessage", () => {
  it("returns null when action result is undefined", () => {
    expect(getAuthActionErrorMessage(undefined)).toBeNull();
  });

  it("returns null when action succeeds", () => {
    expect(getAuthActionErrorMessage({ ok: true, data: null })).toBeNull();
  });

  it("returns error message when action fails", () => {
    expect(
      getAuthActionErrorMessage({
        ok: false,
        code: "INVALID_CREDENTIALS",
        error: "Email hoặc mật khẩu không đúng.",
      }),
    ).toBe("Email hoặc mật khẩu không đúng.");
  });
});
