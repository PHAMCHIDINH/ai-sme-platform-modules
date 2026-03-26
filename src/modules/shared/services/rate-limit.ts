import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type EnvLike = {
  UPSTASH_REDIS_REST_URL?: string;
  UPSTASH_REDIS_REST_TOKEN?: string;
};

export type RateLimitWindow = `${number} s` | `${number} m` | `${number} h`;

export type EnforceRateLimitParams = {
  key: string;
  limit: number;
  window: RateLimitWindow;
  env?: EnvLike;
};

export type RateLimitDecision = {
  success: boolean;
  bypassed: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

const ratelimiterCache = new Map<string, Ratelimit>();

function getEnv(env?: EnvLike): Required<EnvLike> {
  const source = env ?? process.env;
  return {
    UPSTASH_REDIS_REST_URL: source.UPSTASH_REDIS_REST_URL?.trim() ?? "",
    UPSTASH_REDIS_REST_TOKEN: source.UPSTASH_REDIS_REST_TOKEN?.trim() ?? "",
  };
}

function hasUpstashConfig(env?: EnvLike) {
  const vars = getEnv(env);
  return Boolean(vars.UPSTASH_REDIS_REST_URL && vars.UPSTASH_REDIS_REST_TOKEN);
}

function getLimiter(limit: number, window: RateLimitWindow, env?: EnvLike) {
  const envVars = getEnv(env);
  const cacheKey = `${envVars.UPSTASH_REDIS_REST_URL}:${limit}:${window}`;

  const cached = ratelimiterCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const redis = new Redis({
    url: envVars.UPSTASH_REDIS_REST_URL,
    token: envVars.UPSTASH_REDIS_REST_TOKEN,
  });

  const ratelimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, window),
    analytics: true,
    prefix: "ai-sme",
  });

  ratelimiterCache.set(cacheKey, ratelimiter);
  return ratelimiter;
}

export function buildRateLimitKey(scope: string, identifier: string) {
  const cleanScope = scope.trim().toLowerCase().replace(/[^a-z0-9:_-]+/g, "-");
  const cleanIdentifier = identifier.trim().toLowerCase().replace(/[^a-z0-9:_-]+/g, "-");
  return `${cleanScope}:${cleanIdentifier}`;
}

export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) {
    return realIp;
  }

  return "unknown";
}

export async function enforceRateLimit(params: EnforceRateLimitParams): Promise<RateLimitDecision> {
  const nowInSeconds = Math.floor(Date.now() / 1000);

  if (!hasUpstashConfig(params.env)) {
    return {
      success: true,
      bypassed: true,
      limit: params.limit,
      remaining: params.limit,
      reset: nowInSeconds,
    };
  }

  try {
    const limiter = getLimiter(params.limit, params.window, params.env);
    const result = await limiter.limit(params.key);

    return {
      success: result.success,
      bypassed: false,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    console.error("[RATE_LIMIT_ERROR]", error);
    return {
      success: true,
      bypassed: true,
      limit: params.limit,
      remaining: 0,
      reset: nowInSeconds,
    };
  }
}
