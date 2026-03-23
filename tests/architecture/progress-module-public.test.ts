import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const publicPath = join(root, "src", "modules", "progress", "public.ts");

describe("progress module public surface", () => {
  it("exports progress services and repo", () => {
    const source = readFileSync(publicPath, "utf8");
    expect(source).toContain('export * from "./services/index";');
    expect(source).toContain('export * from "./repo/progress-repo";');
  });
});
