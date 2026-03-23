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
});
