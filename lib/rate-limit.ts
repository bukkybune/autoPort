/**
 * In-memory rate limiter. Works correctly for single-instance deployments.
 * For multi-instance / serverless (Vercel), upgrade to an edge-compatible
 * store such as @upstash/ratelimit + Vercel KV when traffic warrants it.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Periodically clean up expired entries to prevent unbounded memory growth.
// Only runs in environments that support setInterval (not edge runtime).
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    store.forEach((entry, key) => {
      if (now > entry.resetAt) store.delete(key);
    });
  }, 60_000);
}

export interface RateLimitResult {
  success: boolean;
  /** Remaining requests allowed in the current window */
  remaining: number;
  /** Seconds until the window resets */
  retryAfter: number;
}

/**
 * @param key      Unique identifier for the limit bucket (e.g. "signup:<ip>")
 * @param max      Maximum requests allowed in the window
 * @param windowMs Window size in milliseconds
 */
export function rateLimit(
  key: string,
  max: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || now > existing.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: max - 1, retryAfter: 0 };
  }

  if (existing.count >= max) {
    return {
      success: false,
      remaining: 0,
      retryAfter: Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  existing.count += 1;
  return { success: true, remaining: max - existing.count, retryAfter: 0 };
}

/** Extract a best-effort IP from Next.js request headers. */
export function getClientIp(req: Request): string {
  const headers = req.headers;
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("x-real-ip") ??
    "unknown"
  );
}
