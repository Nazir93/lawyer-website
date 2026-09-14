/**
 * Простой in-memory rate limit (на процесс).
 * Для multi-instance позже — Redis; сейчас защита от брутфорса на одном инстансе.
 */

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
};

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function checkRateLimit(params: {
  key: string;
  limit: number;
  windowMs: number;
  now?: number;
}): RateLimitResult {
  const now = params.now ?? Date.now();
  const existing = buckets.get(params.key);

  if (!existing || now >= existing.resetAt) {
    buckets.set(params.key, {
      count: 1,
      resetAt: now + params.windowMs,
    });
    return {
      allowed: true,
      remaining: params.limit - 1,
      retryAfterMs: 0,
    };
  }

  if (existing.count >= params.limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.max(0, existing.resetAt - now),
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: params.limit - existing.count,
    retryAfterMs: 0,
  };
}

/** Сброс для тестов */
export function resetRateLimitStore() {
  buckets.clear();
}

export function clientIpFromRequest(request: {
  headers: { get(name: string): string | null };
}): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}
