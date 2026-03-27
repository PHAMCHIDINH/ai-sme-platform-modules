import { describe, expect, it, vi } from "vitest";

import { measureAsync } from "./perf";

describe("measureAsync", () => {
  it("returns the function result and logs elapsed time", async () => {
    const logger = vi.fn();

    const result = await measureAsync("student.projects", async () => "ok", logger);

    expect(result).toBe("ok");
    expect(logger).toHaveBeenCalledWith(
      expect.objectContaining({
        label: "student.projects",
        elapsedMs: expect.any(Number),
      }),
    );
  });
});
