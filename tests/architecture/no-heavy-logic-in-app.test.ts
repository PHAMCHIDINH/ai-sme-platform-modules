import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const appRoot = "src/app";
const disallowedPatterns = [
  /import\s*\{[^}]*\bprisma\b[^}]*\}\s*from\s*["'][^"']+["']/,
  /from\s+["']@\/modules\/[^"']+\/repo\/[^"']+["']/,
  /from\s+["']@\/lib\/repos\/[^"']+["']/,
];

function collectTsFiles(dir: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...collectTsFiles(fullPath));
      continue;
    }

    if (fullPath.endsWith(".ts") || fullPath.endsWith(".tsx")) {
      files.push(fullPath);
    }
  }

  return files;
}

describe("src/app thin-layer boundaries", () => {
  it("does not import prisma or repo internals directly", () => {
    const offenders: string[] = [];

    for (const file of collectTsFiles(appRoot)) {
      const source = readFileSync(file, "utf8");
      const hasDisallowedImport = disallowedPatterns.some((pattern) => pattern.test(source));

      if (hasDisallowedImport) {
        offenders.push(file);
      }
    }

    expect(offenders).toEqual([]);
  });
});
