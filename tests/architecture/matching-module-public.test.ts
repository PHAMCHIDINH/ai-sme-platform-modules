import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const publicPath = join(root, "src", "modules", "matching", "public.ts");

describe("matching module public surface", () => {
  it("exports matching ranker, presenter, and student profile schema", () => {
    const source = readFileSync(publicPath, "utf8");
    expect(source).toContain('export * from "./services/matching";');
    expect(source).toContain('export * from "./services/presenter";');
    expect(source).toContain('export * from "./types/student-profile";');
  });
});
