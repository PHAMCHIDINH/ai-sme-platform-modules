import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();

function readSource(relativePath: string) {
  return fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
}

describe("dashboard discovery layout contracts", () => {
  it("uses cached and instrumented reads for student discovery", () => {
    const pageSource = readSource("src/app/(dashboard)/student/projects/page.tsx");

    expect(pageSource).toContain('measureAsync("auth.student.projects"');
    expect(pageSource).toContain("findStudentProfileWithEmbeddingCached");
    expect(pageSource).toContain("listStudentDiscoveryProjectsCached");
    expect(pageSource).toContain("listStudentInvitationsCached");
    expect(pageSource).toContain("Promise.all([");
  });

  it("uses cached dashboard reads", () => {
    const dashboardSource = readSource("src/app/(dashboard)/student/dashboard/page.tsx");

    expect(dashboardSource).toContain('measureAsync("auth.student.dashboard"');
    expect(dashboardSource).toContain("findStudentDashboardDataCached");
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
