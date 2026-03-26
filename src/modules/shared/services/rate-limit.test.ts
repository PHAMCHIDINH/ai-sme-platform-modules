import { describe, expect, it } from "vitest";

import { buildRateLimitKey, enforceRateLimit, getClientIp } from "./rate-limit";

describe("rate-limit service", () => {
  it("builds a normalized key", () => {
    expect(buildRateLimitKey("chat-brief", "  User:ABC  ")).toBe("chat-brief:user:abc");
  });

  it("extracts client IP from x-forwarded-for", () => {
    const request = new Request("https://example.com", {
      headers: {
        "x-forwarded-for": "203.0.113.10, 70.41.3.18",
      },
    });

    expect(getClientIp(request)).toBe("203.0.113.10");
  });

  it("falls back to unknown when no IP headers", () => {
    const request = new Request("https://example.com");
    expect(getClientIp(request)).toBe("unknown");
  });

  it("bypasses limiting when Upstash env is missing", async () => {
    const result = await enforceRateLimit({
      key: "chat-brief:user-1",
      limit: 10,
      window: "1 m",
      env: {
        UPSTASH_REDIS_REST_URL: "",
        UPSTASH_REDIS_REST_TOKEN: "",
      },
    });

    expect(result).toMatchObject({
      success: true,
      bypassed: true,
      limit: 10,
    });
  });
});
