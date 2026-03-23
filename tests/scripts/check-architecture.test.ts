import { describe, expect, it } from "vitest";

import { findArchitectureViolations } from "../../scripts/check-architecture.mjs";

type Fixture = {
  file: string;
  content: string;
};

function rulesFor(fixtures: Fixture[]) {
  return findArchitectureViolations(fixtures).map((violation) => violation.rule);
}

describe("check-architecture rule engine", () => {
  it("flags app importing module repo internals", () => {
    const rules = rulesFor([
      {
        file: "src/app/api/demo/route.ts",
        content: 'import { x } from "@/modules/project/repo/project-repo";',
      },
    ]);

    expect(rules).toContain("no-app-to-module-repo");
  });

  it("flags deep cross-module imports", () => {
    const rules = rulesFor([
      {
        file: "src/modules/progress/services/use-cases.ts",
        content: 'import { x } from "@/modules/project/repo/project-repo";',
      },
    ]);

    expect(rules).toContain("no-cross-module-deep-import");
  });

  it("flags module importing src/app", () => {
    const rules = rulesFor([
      {
        file: "src/modules/project/services/demo.ts",
        content: 'import { y } from "@/app/api/projects/route";',
      },
    ]);

    expect(rules).toContain("no-module-to-app");
  });

  it("flags @/lib imports inside migrated roots", () => {
    const rules = rulesFor([
      {
        file: "src/modules/project/services/demo.ts",
        content: 'import { z } from "@/lib/utils";',
      },
    ]);

    expect(rules).toContain("no-lib-imports");
  });

  it("flags intra-module ui->repo dependency", () => {
    const rules = rulesFor([
      {
        file: "src/modules/project/ui/card.tsx",
        content: 'import { q } from "../repo/project-repo";',
      },
    ]);

    expect(rules).toContain("no-ui-to-repo");
  });

  it("flags intra-module repo->ui dependency", () => {
    const rules = rulesFor([
      {
        file: "src/modules/project/repo/project-repo.ts",
        content: 'import { Button } from "../ui/button";',
      },
    ]);

    expect(rules).toContain("no-repo-to-ui");
  });

  it("allows valid entrypoint imports", () => {
    const rules = rulesFor([
      {
        file: "src/modules/progress/services/use-cases.ts",
        content: 'import { x } from "@/modules/project";',
      },
      {
        file: "src/app/api/projects/route.ts",
        content: 'import { y } from "@/modules/shared";',
      },
      {
        file: "src/modules/project/services/presenter.ts",
        content: 'import { z } from "@/modules/shared";',
      },
      {
        file: "src/modules/project/ui/card.tsx",
        content: 'import { Button } from "@/modules/shared/ui";',
      },
    ]);

    expect(rules).toEqual([]);
  });
});
