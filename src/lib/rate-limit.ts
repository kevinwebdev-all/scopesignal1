const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 5;
const MAX_TRACKED_KEYS = 5_000;

const requestLog = new Map<string, number[]>();

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

/*
 * In-memory, per-instance rate limiter.
 * On Vercel, each warm serverless instance keeps its own counts, so this
 * limits bursts from a single client but is not a global guarantee.
 */
export function checkRateLimit(key: string, now: number = Date.now()): RateLimitResult {
  const windowStart = now - WINDOW_MS;
  const recent = (requestLog.get(key) ?? []).filter((timestamp) => timestamp > windowStart);

  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    requestLog.set(key, recent);
    const oldest = recent[0];
    const retryAfterMs = oldest + WINDOW_MS - now;

    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
    };
  }

  recent.push(now);
  requestLog.set(key, recent);

  if (requestLog.size > MAX_TRACKED_KEYS) {
    pruneExpired(windowStart);
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

function pruneExpired(windowStart: number): void {
  for (const [key, timestamps] of requestLog) {
    const active = timestamps.filter((timestamp) => timestamp > windowStart);

    if (active.length === 0) {
      requestLog.delete(key);
    } else {
      requestLog.set(key, active);
    }
  }
}
