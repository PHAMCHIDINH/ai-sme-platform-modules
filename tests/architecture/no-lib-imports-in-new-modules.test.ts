import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const roots = ["src/app", "src/modules"];
const importPattern = /from\s+["']@\/lib\//g;

function collectFiles(dir: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...collectFiles(fullPath));
      continue;
    }

    if (fullPath.endsWith(".ts") || fullPath.endsWith(".tsx")) {
      files.push(fullPath);
    }
  }

  return files;
}

describe("no lib imports in src/app and src/modules", () => {
  it("disallows @/lib/* imports in migrated roots", () => {
    const offenders: string[] = [];

    for (const root of roots) {
      for (const file of collectFiles(root)) {
        const source = readFileSync(file, "utf8");

        if (importPattern.test(source)) {
          offenders.push(file);
        }
      }
    }

    expect(offenders).toEqual([]);
  });
});
