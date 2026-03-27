import { describe, expect, it } from "vitest";

import { buildReadCacheKey, buildReadCacheTags } from "./read-cache";

describe("read-cache helpers", () => {
  it("builds a stable cache key from namespace and parts", () => {
    expect(buildReadCacheKey("student-projects", ["student-1", null, 3])).toEqual([
      "student-projects",
      "student-1",
      "null",
      "3",
    ]);
  });

  it("builds scoped tags when a scope is provided", () => {
    expect(buildReadCacheTags("student-dashboard", "student-1")).toEqual([
      "student-dashboard",
      "student-dashboard:student-1",
    ]);
  });
});
