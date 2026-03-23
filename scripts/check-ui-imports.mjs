#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT_ROOT = process.cwd();
const BASE_UI_PACKAGE_JSON_PATH = path.join(PROJECT_ROOT, "node_modules", "@base-ui", "react", "package.json");
const IMPORT_REGEX = /from\s+["']@base-ui\/react\/([^"']+)["']/g;

function toPosixPath(value) {
  return value.split(path.sep).join("/");
}

export function shouldScanForBaseUi(relativePath) {
  if (!relativePath.endsWith(".ts") && !relativePath.endsWith(".tsx")) {
    return false;
  }

  if (relativePath.startsWith("src/app/")) {
    return true;
  }

  if (/^src\/modules\/[^/]+\/ui\//.test(relativePath)) {
    return true;
  }

  if (relativePath.startsWith("components/ui/")) {
    return true;
  }

  return false;
}

export function getScanRoots(projectRoot, exists = fs.existsSync) {
  const roots = [path.join(projectRoot, "src", "app"), path.join(projectRoot, "src", "modules")];
  const legacyUiRoot = path.join(projectRoot, "components", "ui");
  const hasLegacyUi = exists(legacyUiRoot);

  if (hasLegacyUi) {
    roots.push(legacyUiRoot);
  }

  return {
    roots,
    hasLegacyUi,
  };
}

function listFilesRecursively(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const nested = entries.map((entry) => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next" || entry.name === "dist") {
        return [];
      }
      return listFilesRecursively(fullPath);
    }

    if (!entry.isFile()) {
      return [];
    }

    return [fullPath];
  });

  return nested.flat();
}

function collectScanFiles(projectRoot) {
  const { roots, hasLegacyUi } = getScanRoots(projectRoot);
  const files = roots
    .flatMap((root) => listFilesRecursively(root))
    .map((fullPath) => ({
      fullPath,
      relativePath: toPosixPath(path.relative(projectRoot, fullPath)),
    }))
    .filter((entry) => shouldScanForBaseUi(entry.relativePath));

  return {
    files,
    hasLegacyUi,
  };
}

export function findInvalidBaseUiImports(entries, exportKeys) {
  const violations = [];

  for (const entry of entries) {
    const matches = [...entry.content.matchAll(IMPORT_REGEX)];

    for (const match of matches) {
      const subpath = `./${match[1]}`;
      if (!exportKeys.has(subpath)) {
        violations.push({
          file: entry.relativePath,
          importPath: `@base-ui/react/${match[1]}`,
        });
      }
    }
  }

  return violations;
}

function loadBaseUiExportKeys() {
  if (!fs.existsSync(BASE_UI_PACKAGE_JSON_PATH)) {
    throw new Error("Missing @base-ui/react package.");
  }

  const baseUiPackage = JSON.parse(fs.readFileSync(BASE_UI_PACKAGE_JSON_PATH, "utf8"));
  const exportsField = baseUiPackage.exports ?? {};
  return new Set(Object.keys(exportsField));
}

export function runUiImportCheck(projectRoot = PROJECT_ROOT) {
  let exportKeys;

  try {
    exportKeys = loadBaseUiExportKeys();
  } catch (error) {
    console.error(`[check-ui-imports] ${error.message}`);
    return 1;
  }

  const { files, hasLegacyUi } = collectScanFiles(projectRoot);
  const entries = files.map((file) => ({
    relativePath: file.relativePath,
    content: fs.readFileSync(file.fullPath, "utf8"),
  }));

  const violations = findInvalidBaseUiImports(entries, exportKeys);

  if (hasLegacyUi) {
    console.warn("[check-ui-imports] WARN legacy components/ui directory still exists; keep migration cleanup in progress.");
  }

  if (violations.length > 0) {
    for (const violation of violations) {
      console.error(`[check-ui-imports] Invalid Base UI import in ${violation.file}: ${violation.importPath}`);
    }
    return 1;
  }

  console.log("[check-ui-imports] OK");
  return 0;
}

const isMainModule = process.argv[1]
  ? path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
  : false;

if (isMainModule) {
  process.exit(runUiImportCheck());
}
