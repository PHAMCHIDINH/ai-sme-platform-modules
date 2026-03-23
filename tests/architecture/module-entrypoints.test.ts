import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const moduleNames = [
  "auth",
  "project",
  "application",
  "progress",
  "ai",
  "matching",
  "shared",
] as const;

const root = process.cwd();

describe("module entrypoint convention", () => {
  for (const moduleName of moduleNames) {
    it(`${moduleName} has index.ts`, () => {
      const indexPath = join(root, "src", "modules", moduleName, "index.ts");
      expect(existsSync(indexPath)).toBe(true);
    });

    it(`${moduleName} index re-exports public`, () => {
      const indexPath = join(root, "src", "modules", moduleName, "index.ts");
      const source = readFileSync(indexPath, "utf8");
      expect(source).toContain('export * from "./public";');
    });
  }
});
