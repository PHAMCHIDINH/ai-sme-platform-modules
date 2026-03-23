import { describe, expect, it } from "vitest";

import {
  parseMilestones,
  parseProgressUpdates,
  parseRating,
  progressStatusClassName,
  progressStatusLabel,
} from "@/modules/progress";

describe("progress-lifecycle service", () => {
  it("parses valid milestones and filters invalid entries", () => {
    const milestones = parseMilestones([
      { id: "m1", title: "Kickoff", createdAt: "2026-03-21T00:00:00.000Z" },
      { id: "m2", title: 123, createdAt: "invalid" },
    ]);

    expect(milestones).toEqual([
      { id: "m1", title: "Kickoff", createdAt: "2026-03-21T00:00:00.000Z" },
    ]);
  });

  it("parses valid progress updates and filters invalid entries", () => {
    const updates = parseProgressUpdates([
      { id: "u1", content: "Done A", createdAt: "2026-03-21T00:00:00.000Z" },
      { foo: "bar" },
    ]);

    expect(updates).toEqual([
      { id: "u1", content: "Done A", createdAt: "2026-03-21T00:00:00.000Z" },
    ]);
  });

  it("validates ratings in range 1-5", () => {
    expect(parseRating("5")).toBe(5);
    expect(parseRating("0")).toBeNull();
    expect(parseRating("6")).toBeNull();
    expect(parseRating("x")).toBeNull();
  });

  it("returns status labels and classes", () => {
    expect(progressStatusLabel("COMPLETED")).toBe("Hoàn thành");
    expect(progressStatusClassName("SUBMITTED")).toContain("amber");
  });
});
