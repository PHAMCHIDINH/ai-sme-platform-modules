import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const scannedRoots = ["src", "components"];
const disallowedImportPatterns = [/from\s+["']@\/lib\//, /from\s+["']@\/components\/ui\//];
const legacyDirs = ["lib", "components/ui"];

function collectFiles(dir: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      if (fullPath === "components/ui") {
        continue;
      }
      files.push(...collectFiles(fullPath));
      continue;
    }

    if (fullPath.endsWith(".ts") || fullPath.endsWith(".tsx")) {
      files.push(fullPath);
    }
  }

  return files;
}

function collectTsFilesIfAny(dir: string): string[] {
  let entries: string[] = [];

  try {
    entries = readdirSync(dir);
  } catch {
    return [];
  }

  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...collectTsFilesIfAny(fullPath));
      continue;
    }

    if (fullPath.endsWith(".ts") || fullPath.endsWith(".tsx")) {
      files.push(fullPath);
    }
  }

  return files;
}

describe("legacy layout cleanup", () => {
  it("has no legacy imports from lib or components/ui", () => {
    const offenders: string[] = [];

    for (const root of scannedRoots) {
      for (const file of collectFiles(root)) {
        const source = readFileSync(file, "utf8");

        if (disallowedImportPatterns.some((pattern) => pattern.test(source))) {
          offenders.push(file);
        }
      }
    }

    expect(offenders).toEqual([]);
  });

  it("has no legacy TypeScript sources under lib or components/ui", () => {
    const legacyTsFiles = legacyDirs.flatMap((dir) => collectTsFilesIfAny(dir));
    expect(legacyTsFiles).toEqual([]);
  });
});
