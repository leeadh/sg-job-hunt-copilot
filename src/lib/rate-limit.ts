interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) store.delete(key);
  }
}, 30_000);

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

const LIMITS = {
  own_key:    { maxRequests: 20, windowMs: 60_000 },
  shared_key: { maxRequests: 20, windowMs: 60_000 },
} as const;

export function checkRateLimit(ip: string, mode: "own_key" | "shared_key" = "own_key"): RateLimitResult {
  const { maxRequests, windowMs } = LIMITS[mode];
  const key = `${mode}:${ip}`;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, retryAfterMs: 0 };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, retryAfterMs: entry.resetAt - now };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count, retryAfterMs: 0 };
}
