import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("auth module public surface", () => {
  const root = process.cwd();
  const publicPath = join(root, "src", "modules", "auth", "public.ts");
  const actionsPath = join(root, "src", "modules", "auth", "api", "actions.ts");
  const sessionPath = join(root, "src", "modules", "auth", "services", "session.ts");

  it("exports auth actions from public.ts", () => {
    expect(existsSync(actionsPath)).toBe(true);
    const source = readFileSync(publicPath, "utf8");
    expect(source).toContain('export * from "./api/actions";');
  });

  it("exports session helpers from public.ts", () => {
    expect(existsSync(sessionPath)).toBe(true);
    const source = readFileSync(publicPath, "utf8");
    expect(source).toContain('export * from "./services/session";');
  });
});
