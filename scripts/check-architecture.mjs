#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT_DIR = process.cwd();
const SCAN_ROOTS = ["src/app", "src/modules"];
const INCLUDED_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".mjs"]);

const IMPORT_PATTERNS = [
  /(?:import|export)\s[^"']*from\s*["']([^"']+)["']/g,
  /import\(\s*["']([^"']+)["']\s*\)/g,
  /require\(\s*["']([^"']+)["']\s*\)/g,
];

function toPosixPath(value) {
  return value.split(path.sep).join("/");
}

function normalizeRelativePath(value) {
  return toPosixPath(path.posix.normalize(value));
}

function parseImportSpecifiers(content) {
  const specs = [];

  for (const pattern of IMPORT_PATTERNS) {
    for (const match of content.matchAll(pattern)) {
      if (match[1]) {
        specs.push(match[1]);
      }
    }
  }

  return specs;
}

function moduleInfo(filePath) {
  const match = /^src\/modules\/([^/]+)\/?(.*)$/.exec(filePath);
  if (!match) {
    return null;
  }

  return {
    module: match[1],
    subPath: match[2] ?? "",
  };
}

function resolveSpecifier(fromFile, specifier) {
  if (specifier.startsWith("@/")) {
    return normalizeRelativePath(path.posix.join("src", specifier.slice(2)));
  }

  if (!specifier.startsWith(".")) {
    return null;
  }

  const fromDir = path.posix.dirname(fromFile);
  const resolved = normalizeRelativePath(path.posix.join(fromDir, specifier));

  if (resolved.startsWith("../")) {
    return null;
  }

  return resolved;
}

function isAllowedEntrypointSubPath(moduleName, subPath) {
  if (subPath === "" || subPath === "index" || subPath === "public") {
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

export function findArchitectureViolations(entries) {
  const violations = [];

  for (const entry of entries) {
    const file = entry.file;
    const content = entry.content;
    const fromModule = moduleInfo(file);
    const fromIsApp = file.startsWith("src/app/");
    const fromIsModule = file.startsWith("src/modules/");

    if (!fromIsApp && !fromIsModule) {
      continue;
    }

    for (const spec of parseImportSpecifiers(content)) {
      const target = resolveSpecifier(file, spec);
      const targetModule = target ? moduleInfo(target) : null;

      if (spec.startsWith("@/lib/")) {
        violations.push({
          rule: "no-lib-imports",
          file,
          spec,
          message: "Do not import @/lib/* inside src/app or src/modules.",
        });
      }

      if (!target) {
        continue;
      }

      if (fromIsApp && /^src\/modules\/[^/]+\/repo(?:\/|$)/.test(target)) {
        violations.push({
          rule: "no-app-to-module-repo",
          file,
          spec,
          message: "src/app must not import module repo internals.",
        });
      }

      if (fromIsModule && target.startsWith("src/app/")) {
        violations.push({
          rule: "no-module-to-app",
          file,
          spec,
          message: "src/modules must not import src/app.",
        });
      }

      if (fromModule && targetModule && fromModule.module !== targetModule.module) {
        const crossModuleSubPath = targetModule.subPath;
        if (!isAllowedEntrypointSubPath(targetModule.module, crossModuleSubPath)) {
          violations.push({
            rule: "no-cross-module-deep-import",
            file,
            spec,
            message: "Cross-module imports must use module entrypoints only.",
          });
        }
      }

      if (fromModule && targetModule && fromModule.module === targetModule.module) {
        const fromSubPath = fromModule.subPath;
        const targetSubPath = targetModule.subPath;

        if (fromSubPath.startsWith("ui/") && (targetSubPath === "repo" || targetSubPath.startsWith("repo/"))) {
          violations.push({
            rule: "no-ui-to-repo",
            file,
            spec,
            message: "Intra-module UI layer must not import repo layer directly.",
          });
        }

        if ((fromSubPath === "repo" || fromSubPath.startsWith("repo/")) && targetSubPath.startsWith("ui/")) {
          violations.push({
            rule: "no-repo-to-ui",
            file,
            spec,
            message: "Intra-module repo layer must not import UI layer.",
          });
        }
      }
    }
  }

  return violations;
}

async function listFiles(dir) {
  let entries;

  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }

  const nested = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (entry.name === "node_modules" || entry.name === ".next" || entry.name === "dist") {
          return [];
        }

        return listFiles(fullPath);
      }

      if (!entry.isFile()) {
        return [];
      }

      if (entry.name.endsWith(".d.ts")) {
        return [];
      }

      if (!INCLUDED_EXTENSIONS.has(path.extname(entry.name))) {
        return [];
      }

      return [fullPath];
    }),
  );

  return nested.flat();
}

async function collectEntriesFromDisk() {
  const absoluteRoots = SCAN_ROOTS.map((scanRoot) => path.join(ROOT_DIR, scanRoot));
  const files = (await Promise.all(absoluteRoots.map((root) => listFiles(root)))).flat();

  return Promise.all(
    files.map(async (file) => {
      const content = await fs.readFile(file, "utf8");
      const rel = toPosixPath(path.relative(ROOT_DIR, file));
      return { file: rel, content };
    }),
  );
}

export async function runArchitectureCheck() {
  const entries = await collectEntriesFromDisk();
  const violations = findArchitectureViolations(entries);

  if (violations.length > 0) {
    console.error("[check-architecture] ERROR violations:");
    for (const violation of violations) {
      console.error(`- [${violation.rule}] ${violation.file} imports ${violation.spec} (${violation.message})`);
    }
    return 1;
  }

  console.log("[check-architecture] OK");
  return 0;
}

const isMainModule = process.argv[1]
  ? path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
  : false;

if (isMainModule) {
  runArchitectureCheck()
    .then((code) => {
      process.exit(code);
    })
    .catch((error) => {
      console.error("[check-architecture] Unexpected failure", error);
      process.exit(1);
    });
}
