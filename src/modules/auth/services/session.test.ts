import { describe, expect, it } from "vitest";

import { getSessionUserId, getSessionUserIdByRole, type AuthSession } from "./session";

describe("auth session helpers", () => {
  it("returns null for missing user id", () => {
    const session = { user: {} } as AuthSession;
    expect(getSessionUserId(session)).toBeNull();
  });

  it("returns user id for matching role", () => {
    const session = { user: { id: "u1", role: "SME" } } as AuthSession;
    expect(getSessionUserIdByRole(session, "SME")).toBe("u1");
  });

  it("returns null for role mismatch", () => {
    const session = { user: { id: "u1", role: "STUDENT" } } as AuthSession;
    expect(getSessionUserIdByRole(session, "SME")).toBeNull();
  });
});
