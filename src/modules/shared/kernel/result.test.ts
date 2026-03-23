import { describe, expect, it } from "vitest";
import { err, ok } from "@/modules/shared";

describe("result envelope", () => {
  it("builds ok result", () => {
    const result = ok({ id: "x" });
    expect(result).toEqual({ ok: true, data: { id: "x" } });
  });

  it("builds error result with code and message", () => {
    const result = err("UNAUTHORIZED", "Bạn không có quyền thực hiện thao tác này.");
    expect(result).toEqual({
      ok: false,
      code: "UNAUTHORIZED",
      error: "Bạn không có quyền thực hiện thao tác này.",
    });
  });
});
