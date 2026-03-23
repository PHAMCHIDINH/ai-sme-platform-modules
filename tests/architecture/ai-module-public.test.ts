import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const publicPath = join(root, "src", "modules", "ai", "public.ts");

describe("ai module public surface", () => {
  it("exports ai services and chat-brief APIs", () => {
    const source = readFileSync(publicPath, "utf8");
    expect(source).toContain('export * from "./services/openai";');
    expect(source).toContain('export * from "./services/ai-embedding";');
    expect(source).toContain('export * from "./services/chat-brief/index";');
  });
});
