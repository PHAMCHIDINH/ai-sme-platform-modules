import { describe, expect, it } from "vitest";

import {
  TimeoutError,
  normalizeEmbeddingText,
  validateEmbeddingText,
  withTimeout,
} from "@/modules/ai";

describe("ai-embedding service", () => {
  it("normalizes surrounding spaces", () => {
    expect(normalizeEmbeddingText("  hello  ")).toBe("hello");
  });

  it("rejects empty text after normalization", () => {
    const result = validateEmbeddingText("   ");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("không hợp lệ");
    }
  });

  it("rejects too long text", () => {
    const result = validateEmbeddingText("a".repeat(4001));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("Text quá dài");
    }
  });

  it("returns validated normalized text", () => {
    const result = validateEmbeddingText(" hello ");
    expect(result).toEqual({ ok: true, value: "hello" });
  });

  it("throws TimeoutError when promise exceeds timeout", async () => {
    await expect(
      withTimeout(
        new Promise((resolve) => {
          setTimeout(() => resolve("late"), 50);
        }),
        5,
      ),
    ).rejects.toBeInstanceOf(TimeoutError);
  });
});
