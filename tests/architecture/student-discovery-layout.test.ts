import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();

function readSource(relativePath: string) {
  return fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
}

describe("dashboard discovery layout contracts", () => {
  it("keeps the dashboard sidebar compact enough to preserve content width", () => {
    const sidebarSource = readSource("components/layout/dashboard-sidebar.tsx");

    expect(sidebarSource).toContain("w-72");
    expect(sidebarSource).not.toContain("w-80");
  });

  it("gives the dashboard shell a wider content container", () => {
    const layoutSource = readSource("src/app/(dashboard)/layout.tsx");

    expect(layoutSource).toContain("max-w-7xl");
  });

  it("uses a narrower filter rail and wider result grid for student discovery", () => {
    const pageSource = readSource("src/app/(dashboard)/student/projects/page.tsx");

    expect(pageSource).toContain("xl:grid-cols-[240px_minmax(0,1fr)]");
    expect(pageSource).toContain("xl:grid-cols-2");
    expect(pageSource).toContain("2xl:grid-cols-3");
    expect(pageSource).toContain("sticky top-6");
  });

  it("defines student loading boundaries for dashboard and discovery routes", () => {
    expect(readSource("src/app/(dashboard)/student/loading.tsx")).toContain("animate-pulse");
    expect(readSource("src/app/(dashboard)/student/projects/loading.tsx")).toContain("animate-pulse");
  });

  it("uses unique browse link keys on the homepage hero", () => {
    const heroSource = readSource("src/modules/shared/ui/portal-search-hero.tsx");

    expect(heroSource).toContain('key={`${link.href}:${link.label}`}');
  });
});
