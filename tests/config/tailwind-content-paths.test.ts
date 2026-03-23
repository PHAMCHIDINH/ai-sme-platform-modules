import { describe, expect, it } from "vitest";
import tailwindConfig from "../../tailwind.config";

function normalizeContentEntries(entries: unknown): string[] {
  if (!Array.isArray(entries)) {
    return [];
  }

  return entries
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => entry.replace(/\\/g, "/"));
}

describe("tailwind content configuration", () => {
  it("includes src roots used by app-router and module UI", () => {
    const content = normalizeContentEntries(tailwindConfig.content);

    expect(content).toContain("./src/app/**/*.{js,ts,jsx,tsx,mdx}");
    expect(content).toContain("./src/modules/**/*.{js,ts,jsx,tsx,mdx}");
    expect(content).toContain("./components/**/*.{js,ts,jsx,tsx,mdx}");
  });
});
