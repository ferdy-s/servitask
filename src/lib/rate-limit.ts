type Bucket = { count: number; resetAt: number };
const memory = new Map<string, Bucket>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = memory.get(key);

  if (!bucket || bucket.resetAt <= now) {
    memory.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }

  bucket.count += 1;
  memory.set(key, bucket);

  if (bucket.count > limit) {
    const retryAfterSec = Math.ceil((bucket.resetAt - now) / 1000);
    return { ok: false, remaining: 0, retryAfterSec };
  }

  return { ok: true, remaining: limit - bucket.count };
}
