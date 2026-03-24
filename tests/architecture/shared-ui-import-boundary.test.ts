import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const scanRoots = ["src/app", "src/modules", "components"];
const sharedRootImportPattern = /import\s*{([^}]*)}\s*from\s+["']@\/modules\/shared["']/g;
const sharedPublicPath = "src/modules/shared/public.ts";
const UI_EXPORT_NAMES = new Set([
  "Avatar",
  "Badge",
  "Button",
  "Card",
  "CardContent",
  "CardDescription",
  "CardFooter",
  "CardHeader",
  "CardTitle",
  "Dialog",
  "DialogClose",
  "DialogContent",
  "DialogDescription",
  "DialogFooter",
  "DialogHeader",
  "DialogOverlay",
  "DialogPortal",
  "DialogTitle",
  "DialogTrigger",
  "Input",
  "Label",
  "Modal",
  "NavigationMenu",
  "Rating",
  "ScrollArea",
  "Select",
  "SelectContent",
  "SelectGroup",
  "SelectItem",
  "SelectLabel",
  "SelectScrollDownButton",
  "SelectScrollUpButton",
  "SelectSeparator",
  "SelectTrigger",
  "SelectValue",
  "Separator",
  "Sheet",
  "Sidebar",
  "Skeleton",
  "Table",
  "TableBody",
  "TableCaption",
  "TableCell",
  "TableFooter",
  "TableHead",
  "TableHeader",
  "TableRow",
  "Tabs",
  "Textarea",
  "Tooltip",
]);

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

function parseImportedNames(specifierBlock: string): string[] {
  return specifierBlock
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => entry.replace(/^type\s+/, "").split(/\s+as\s+/)[0]?.trim() ?? "")
    .filter(Boolean);
}

describe("shared module UI boundary", () => {
  it("does not re-export UI primitives from shared root public entrypoint", () => {
    const source = readFileSync(sharedPublicPath, "utf8");
    expect(source).not.toMatch(/export\s+\*\s+from\s+["']\.\/ui\//);
  });

  it("does not import UI primitives from @/modules/shared", () => {
    const offenders: string[] = [];

    for (const root of scanRoots) {
      for (const file of collectTsFiles(root)) {
        const source = readFileSync(file, "utf8");
        const imports = [...source.matchAll(sharedRootImportPattern)];

        for (const match of imports) {
          const names = parseImportedNames(match[1] ?? "");
          const uiNames = names.filter((name) => UI_EXPORT_NAMES.has(name));

          if (uiNames.length > 0) {
            offenders.push(`${file}: ${uiNames.join(", ")}`);
          }
        }
      }
    }

    expect(offenders).toEqual([]);
  });
});
