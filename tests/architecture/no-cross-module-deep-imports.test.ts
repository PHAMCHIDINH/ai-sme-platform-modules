import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const roots = ["src/app", "src/modules"];
const deepModuleImportPattern = /from\s+["']@\/modules\/([a-z-]+)\/([^"']+)["']/g;

function isAllowedDeepEntrypoint(moduleName: string, subPath: string) {
  if (subPath === "index" || subPath === "public") {
    return true;
  }

  if (moduleName === "shared" && (subPath === "ui" || subPath.startsWith("ui/"))) {
    return true;
  }

  if (moduleName === "shared" && (subPath === "server" || subPath.startsWith("server/"))) {
    return true;
  }

  return false;
}

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

describe("module imports use entrypoints only", () => {
  it("disallows deep @/modules/<feature>/* imports", () => {
    const offenders: string[] = [];

    for (const root of roots) {
      for (const file of collectTsFiles(root)) {
        const source = readFileSync(file, "utf8");
        const matches = [...source.matchAll(deepModuleImportPattern)];

        for (const match of matches) {
          const moduleName = match[1] ?? "";
          const subPath = match[2] ?? "";

          if (!isAllowedDeepEntrypoint(moduleName, subPath)) {
            offenders.push(file);
            break;
          }
        }
      }
    }

    expect(offenders).toEqual([]);
  });
});
