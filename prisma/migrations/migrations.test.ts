import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("prisma migrations", () => {
  it("contains partial unique index for accepted application invariant", () => {
    const migrationPath = path.resolve(
      process.cwd(),
      "prisma/migrations/20260321090000_single_accepted_application_per_project/migration.sql",
    );

    const sql = fs.readFileSync(migrationPath, "utf8");

    expect(sql).toContain("CREATE UNIQUE INDEX");
    expect(sql).toContain("\"Application\" (\"projectId\")");
    expect(sql).toContain("WHERE \"status\" = 'ACCEPTED'");
  });

  it("contains performance indexes for dashboard and discovery reads", () => {
    const migrationPath = path.resolve(
      process.cwd(),
      "prisma/migrations/20260327141000_add_perf_indexes/migration.sql",
    );

    const sql = fs.readFileSync(migrationPath, "utf8");

    expect(sql).toContain('CREATE INDEX "Project_status_createdAt_idx"');
    expect(sql).toContain('CREATE INDEX "Application_studentId_status_initiatedBy_idx"');
    expect(sql).toContain('CREATE INDEX "ProjectProgress_studentId_status_idx"');
    expect(sql).toContain('CREATE INDEX "Evaluation_evaluateeId_type_idx"');
  });
});
