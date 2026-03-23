import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  findInvalidBaseUiImports,
  getScanRoots,
  shouldScanForBaseUi,
} from "../../scripts/check-ui-imports.mjs";

describe("check-ui-imports scan coverage", () => {
  it("scans src/app and module ui folders", () => {
    expect(shouldScanForBaseUi("src/app/api/projects/route.ts")).toBe(true);
    expect(shouldScanForBaseUi("src/modules/shared/ui/button.tsx")).toBe(true);
    expect(shouldScanForBaseUi("src/modules/project/ui/card.tsx")).toBe(true);
  });

  it("ignores non-ui module files", () => {
    expect(shouldScanForBaseUi("src/modules/project/services/presenter.ts")).toBe(false);
  });

  it("includes legacy components/ui only when present", () => {
    const projectRoot = "/tmp/repo";
    const legacyRoot = path.join(projectRoot, "components", "ui");

    const withLegacy = getScanRoots(projectRoot, (input) => input === legacyRoot);
    const withoutLegacy = getScanRoots(projectRoot, () => false);

    expect(withLegacy.hasLegacyUi).toBe(true);
    expect(withLegacy.roots).toContain(legacyRoot);
    expect(withoutLegacy.hasLegacyUi).toBe(false);
    expect(withoutLegacy.roots).not.toContain(legacyRoot);
  });
});

describe("check-ui-imports base-ui validation", () => {
  it("flags invalid @base-ui/react subpath", () => {
    const violations = findInvalidBaseUiImports(
      [
        {
          relativePath: "src/app/page.tsx",
          content: 'import { X } from "@base-ui/react/not-real";',
        },
      ],
      new Set(["./dialog"]),
    );

    expect(violations).toEqual([
      {
        file: "src/app/page.tsx",
        importPath: "@base-ui/react/not-real",
      },
    ]);
  });

  it("accepts valid @base-ui/react subpath", () => {
    const violations = findInvalidBaseUiImports(
      [
        {
          relativePath: "src/modules/shared/ui/dialog.tsx",
          content: 'import { X } from "@base-ui/react/dialog";',
        },
      ],
      new Set(["./dialog"]),
    );

    expect(violations).toEqual([]);
  });
});
